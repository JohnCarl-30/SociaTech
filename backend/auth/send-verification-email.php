<?php
// send-verification-email.php - Place in /backend/auth/ folder
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/mailer.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || empty($data['email'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email is required'
        ]);
        exit();
    }

    $email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email address'
        ]);
        exit();
    }

    // Check if user exists
    $stmt = $db->prepare("SELECT user_id, fullname, email_verified FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'No account found with this email address'
        ]);
        exit();
    }

    if ($user['email_verified'] == 1) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email is already verified. You can log in now.'
        ]);
        exit();
    }

    // Check rate limiting
    $stmt = $db->prepare("
        SELECT created_at 
        FROM email_verifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$user['user_id']]);
    $lastVerification = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($lastVerification) {
        $lastSent = strtotime($lastVerification['created_at']);
        $timeSince = time() - $lastSent;
        
        if ($timeSince < 120) {
            http_response_code(429);
            $waitTime = ceil((120 - $timeSince) / 60);
            echo json_encode([
                'success' => false,
                'message' => "Please wait {$waitTime} minute(s) before requesting another verification email."
            ]);
            exit();
        }
    }

    // Generate token
    $verificationToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $db->beginTransaction();

    // Mark old tokens as used
    $stmt = $db->prepare("
        UPDATE email_verifications 
        SET used = 1 
        WHERE user_id = ? AND used = 0
    ");
    $stmt->execute([$user['user_id']]);

    // Insert new token
    $stmt = $db->prepare("
        INSERT INTO email_verifications (user_id, email, token, expires_at, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$user['user_id'], $email, $verificationToken, $expiresAt]);

    $verificationUrl = build_backend_url('auth/verify-email.php', ['token' => $verificationToken]);
    
    $emailResult = sendVerificationEmailMessage($email, $user['fullname'], $verificationUrl);

    if (!$emailResult['success']) {
        $db->rollBack();
        error_log("Failed to send verification email to: " . $email . '. ' . ($emailResult['message'] ?? 'Unknown Resend error'));
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send verification email. Please try again later.'
        ]);
        exit();
    }

    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Verification email sent successfully! Please check your inbox.',
        'id' => $emailResult['id'] ?? null,
    ]);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    error_log("Send Verification Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send verification email. Please try again later.'
    ]);
}
?>
