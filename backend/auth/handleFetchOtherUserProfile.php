<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = $_POST['user_id'] ?? null;
if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Missing user_id"]);
    exit;
}
$stmt = $db->prepare("SELECT user_id, username, fullname, bio, profile_image 
        FROM users 
        WHERE user_id = ?");

$stmt->execute([
    $user_id
]);
$otherUserInfo = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode(['success' => true, 'otherUserInfo' => $otherUserInfo]);
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "SQL prepare failed: " . $conn->error
    ]);
    exit;
}

if ($result->num_rows > 0) {
    echo json_encode([
        "success" => true,
        "user" => $result->fetch_assoc()
    ]);
    exit;
} else {
    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);
    exit;
}