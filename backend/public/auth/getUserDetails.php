<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php-error.log');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (ob_get_level())
    ob_end_clean();
ob_start();

try {
    $rawInput = file_get_contents('php://input');
    error_log("Raw input: " . $rawInput);

    if (empty($rawInput)) {
        throw new Exception("Empty request body");
    }

    $input = json_decode($rawInput, true);
    error_log("Decoded input: " . print_r($input, true));

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input: " . json_last_error_msg());
    }

    if (!isset($input['user_id'])) {
        throw new Exception("Missing user_id parameter");
    }

    $connectionFile = __DIR__ . "/../config/database.php";

    if (!file_exists($connectionFile)) {
        throw new Exception("Database connection file not found");
    }

    require_once $connectionFile;

    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $user_id = intval($input['user_id']);

    if ($user_id <= 0) {
        throw new Exception("Invalid user_id value");
    }

    // ✅ Fetch username, email, and profile_image
    $stmt = $conn->prepare("SELECT username, email, profile_image FROM users WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    ob_end_clean();

    if ($user) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "username" => $user['username'],
            "email" => $user['email'],
            "profile_image" => $user['profile_image']
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "error" => "User not found"
        ]);
    }

} catch (Exception $e) {
    if (ob_get_level())
        ob_end_clean();

    error_log("getUserDetails error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
exit;
?>