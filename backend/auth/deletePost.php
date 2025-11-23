<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['success' => true, 'message' => 'OPTIONS ok']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$post_id = $data['post_id'] ?? null;
$user_id = $data['user_id'] ?? null;

if (!$post_id || !$user_id) {
    echo json_encode(['success' => false, 'error' => 'Post ID and User ID are required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify the post belongs to the user
    $checkStmt = $db->prepare("SELECT user_id FROM post WHERE post_id = ?");
    $checkStmt->execute([$post_id]);
    $existingPost = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingPost) {
        echo json_encode(['success' => false, 'error' => 'Post not found']);
        exit;
    }

    if ($existingPost['user_id'] != $user_id) {
        echo json_encode(['success' => false, 'error' => 'You can only delete your own posts']);
        exit;
    }

    $deleteVotesStmt = $db->prepare("DELETE FROM postvote WHERE post_id = ?");
    $deleteVotesStmt->execute([$post_id]);

    $stmt = $db->prepare("DELETE FROM post WHERE post_id = ? AND user_id = ?");
    $stmt->execute([$post_id, $user_id]);

    echo json_encode(['success' => true, 'message' => 'Post deleted successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>