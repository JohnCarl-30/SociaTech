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

require_once '../config/database.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

function sendEmail($email, $fullname, $subject, $htmlMessage) {
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_EMAIL'];
        $mail->Password   = $_ENV['SMTP_PASS'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $_ENV['SMTP_PORT'];
        
        $mail->setFrom($_ENV['SMTP_EMAIL'], 'SociaTech');
        $mail->addAddress($email, $fullname);
        $mail->addReplyTo('no-reply@sociatech.com', 'No Reply');
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlMessage;
        
        $mail->send();
        
        error_log("Email sent successfully to: " . $email);
        return true;
    } catch (Exception $e) {
        error_log("Email Error: {$mail->ErrorInfo}");
        return false;
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Read raw input
    $rawInput = file_get_contents('php://input');
    error_log("Raw input received: " . $rawInput);
    
    $data = json_decode($rawInput, true);
    error_log("Decoded data: " . json_encode($data));
    
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
    
    error_log("User found: " . json_encode($user));

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

    // Verification URL - points to backend for GET request
    $verificationUrl = "http://localhost/Sociatech/backend/auth/verify-email.php?token=" . $verificationToken;
    
    error_log("Verification URL: " . $verificationUrl);
    
    $subject = "Verify Your Email Address - SociaTech";
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Verify Your Email</h1>
            </div>
            <div class='content'>
                <p>Hi {$user['fullname']},</p>
                <p>Please verify your email address to complete your SociaTech registration.</p>
                <p style='text-align: center;'>
                    <a href='{$verificationUrl}' class='button'>Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style='word-break: break-all; color: #667eea;'>{$verificationUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class='footer'>
                <p>&copy; 2024 SociaTech. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $emailSent = sendEmail($email, $user['fullname'], $subject, $message);

    if (!$emailSent) {
        $db->rollBack();
        error_log("Failed to send email to: " . $email);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send verification email. Please try again later.'
        ]);
        exit();
    }

    $db->commit();
    
    error_log("Verification email sent successfully to: " . $email);

    echo json_encode([
        'success' => true,
        'message' => 'Verification email sent successfully! Please check your inbox.'
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