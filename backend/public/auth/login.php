<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../utils/token.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection(); 
    
    // Get user with email_verified field
   $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    throw new Exception("User not found");
}

// Normalize status
$status = strtolower(trim($user['status'] ?? ''));

// 🔹 Check ban first
if ($status === 'ban') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Your account has been banned due to violation of our terms and condition',
    ]);
    exit();
}

// 🔹 Check suspended
$suspended_until = $user['suspended_until'] ?? null;
if (!empty($suspended_until) && strtotime($suspended_until) > time()) {
     $dt = new DateTime($suspended_until);
    $formatted = $dt->format('F j, Y \a\t g:i A');

    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Your account has been suspended until ' . $formatted
    ]);
    exit();
}

// 🔹 Then password verification
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password'
    ]);
    exit();
}

  
    
    // Check if email is verified (skip for Google users)
    if (isset($user['email_verified']) && $user['email_verified'] == 0 && empty($user['google_id'])) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Please verify your email address before logging in.',
            'data' => [
                'email' => $email,
                'needsVerification' => true
            ]
        ]);
        exit();
    }
    
    $userId = $user['id'] ?? $user['user_id'] ?? null;
    
    if (!$userId) {
        throw new Exception("User ID not found in database result");
    }
    
    $token = generateToken($userId);

    
    
    unset($user['password']); 
    $_SESSION['user_id'] = $userId;
    $_SESSION['role'] = strtolower($user['role']);
    http_response_code(200);

   

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'token' => $token,
            'user' => $user
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>