<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $user_id = null;
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user_id = $_POST['user_id'] ?? null;
    }

    if (!$user_id) {
        echo json_encode([
            "success" => false,
            "message" => "Missing user_id"
        ]);
        exit;
    }

    $stmt = $db->prepare("
        SELECT 
            user_id, 
            username, 
            fullname, 
            bio, 
            profile_image,
            achievements,
            created_at
        FROM users 
        WHERE user_id = ?
    ");

    $stmt->execute([$user_id]);
    $otherUserInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($otherUserInfo) {
        if (
            !empty($otherUserInfo['profile_image']) &&
            !str_starts_with($otherUserInfo['profile_image'], 'http')
        ) {
            $otherUserInfo['profile_image'] = 'http://localhost/SociaTech/backend/uploads/profile_images/' . $otherUserInfo['profile_image'];
        }
        if ($otherUserInfo['bio'] === null) {
            $otherUserInfo['bio'] = '';
        }
        if ($otherUserInfo['fullname'] === null) {
            $otherUserInfo['fullname'] = '';
        }

        echo json_encode([
            'success' => true,
            'otherUserInfo' => $otherUserInfo
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>