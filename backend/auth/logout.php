<?php
require_once '../config/session.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://socia-tech.vercel.app"); // Change to your frontend URL
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 0);
error_reporting(E_ALL);

start_sociatech_session();

try {
    // Destroy session
    $_SESSION = array();
    
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => get_request_scheme() === 'https',
            'httponly' => true,
            'samesite' => get_request_scheme() === 'https' ? 'None' : 'Lax',
        ]);
    }
    
    session_destroy();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Logged out successfully"
    ]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred during logout"
    ]);
}

?>
