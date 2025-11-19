<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    require_once '../config/database.php';
    require_once '../config/mailer.php';

    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents('php://input'));
    
    if (is_null($data)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON.'
        ]);
        exit();
    }

    if (empty($data->email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        exit();
    }

    $email = trim($data->email);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit();
    }

    $stmt = $db->prepare("SELECT id, fullname, email FROM users WHERE email = :email LIMIT 1");
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$user) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'If an account exists with this email, a password reset link has been sent.'
        ]);
        exit();
    }


    $token = bin2hex(random_bytes(32)); // 64 character token
    $token_hash = hash('sha256', $token);
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $update_stmt = $db->prepare(
        "UPDATE users 
         SET reset_token = :token_hash, 
             reset_token_expires = :expires_at 
         WHERE id = :id"
    );
    $update_stmt->bindParam(":token_hash", $token_hash);
    $update_stmt->bindParam(":expires_at", $expires_at);
    $update_stmt->bindParam(":id", $user['id']);
    
    if (!$update_stmt->execute()) {
        throw new Exception("Failed to store reset token");
    }

    
    $emailResult = sendPasswordResetEmail(
        $user['email'], 
        $user['fullname'], 
        $token // Pass the plain token (not the hash)
    );

    if (!$emailResult['success']) {
        error_log("Failed to send reset email to: " . $user['email']);
        
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'If an account exists with this email, a password reset link has been sent.'
    ]);

} catch (PDOException $e) {
    error_log("Database error in forgot-password.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
} catch (Throwable $e) {
    error_log("Error in forgot-password.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
}
?>