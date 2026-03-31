<?php
// verify-email.php
require_once '../config/app.php';
ini_set('display_errors', 0);
error_reporting(0);

header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
   
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $token = isset($_GET['token']) ? $_GET['token'] : null;
    } else {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);
        $token = isset($data['token']) ? $data['token'] : null;
    }
    
    if (empty($token)) {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            redirect_to_frontend('login', ['error' => 'Verification token is required']);
        } else {
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Verification token is required'
            ]);
            exit();
        }
    }

    // Check if token exists and is valid
    $stmt = $db->prepare("
        SELECT user_id, email, expires_at 
        FROM email_verifications 
        WHERE token = ? AND used = 0
    ");
    $stmt->execute([$token]);
    $verification = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$verification) {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            redirect_to_frontend('login', ['error' => 'Invalid or expired verification token']);
        } else {
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid or expired verification token'
            ]);
            exit();
        }
    }

    // Check if token has expired
    if (strtotime($verification['expires_at']) < time()) {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            redirect_to_frontend('login', ['error' => 'Verification token has expired. Please request a new one.']);
        } else {
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Verification token has expired. Please request a new one.'
            ]);
            exit();
        }
    }

    // Begin transaction
    $db->beginTransaction();

   
    $stmt = $db->prepare("
        UPDATE users 
        SET email_verified = 1, email_verified_at = NOW() 
        WHERE user_id = ?
    ");
    $stmt->execute([$verification['user_id']]);

  
    $stmt = $db->prepare("
        UPDATE email_verifications 
        SET used = 1, verified_at = NOW() 
        WHERE token = ?
    ");
    $stmt->execute([$token]);

    $db->commit();

    // If GET request (from email link), redirect to frontend
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        redirect_to_frontend('login', ['verified' => 'true']);
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Email verified successfully! You can now log in.'
        ]);
    }

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    error_log("Verification Error: " . $e->getMessage());
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        redirect_to_frontend('login', ['error' => 'Verification failed. Please try again.']);
    } else {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Verification failed: ' . $e->getMessage()
        ]);
    }
}
?>
