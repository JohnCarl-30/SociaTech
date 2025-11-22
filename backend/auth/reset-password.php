<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 0);
error_reporting(E_ALL);

// Handle OPTIONS
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

    $database = new Database();
    $db = $database->getConnection();

   
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON.']);
        exit();
    }

    
    if (empty($data->token) || empty($data->new_password) || empty($data->confirmPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token and passwords are required.']);
        exit();
    }

    $token = $data->token;
    $password = $data->new_password;
    $confirmPassword = $data->confirmPassword;


    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long.']);
        exit();
    }

    if (!preg_match('/[A-Z]/', $password)) {
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one uppercase letter.']);
        exit();
    }

    if (!preg_match('/[0-9]/', $password)) {
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one number.']);
        exit();
    }

    if (!preg_match('/[!@#$%^&*(),.?":{}|<>_-]/', $password)) {
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one special character.']);
        exit();
    }

    // PASSWORD MATCH VALIDATION
    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
        exit();
    }

    $token_hash = hash("sha256", $token);

    // Get user
    $stmt = $db->prepare("SELECT user_id, reset_token_expires FROM users WHERE reset_token = :token LIMIT 1");
    $stmt->bindParam(":token", $token_hash);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired reset token.']);
        exit();
    }

    // Check token expiration
    $now = new DateTime();
    $expires = new DateTime($user["reset_token_expires"]);

    if ($now > $expires) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Reset token has expired. Please request a new one.']);
        exit();
    }

    // Hash new password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Update password + clear token
    $update = $db->prepare("
        UPDATE users 
        SET password = :password, reset_token = NULL, reset_token_expires = NULL
        WHERE user_id = :user_id
    ");
    $update->bindParam(":password", $hashed_password);
    $update->bindParam(":user_id", $user["user_id"]);
    $update->execute();

    echo json_encode(['success' => true, 'message' => 'Password has been reset successfully.']);

} catch (Throwable $e) {
    error_log("Error in reset-password.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
}
?>