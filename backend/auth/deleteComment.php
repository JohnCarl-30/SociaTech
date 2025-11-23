<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['success' => true, 'message' => 'OPTIONS ok']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Failed to connect to database');
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        throw new Exception('No JSON received');
    }

    $comment_id = $data['comment_id'] ?? null;
    $user_id = $data['user_id'] ?? null;

    if ($comment_id === null || $user_id === null) {
        throw new Exception('Missing comment_id or user_id');
    }

    // Verify xommwnt from user
    $stmt = $db->prepare("SELECT user_id FROM comments WHERE comment_id = ?");
    $stmt->execute([$comment_id]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$comment) {
        throw new Exception('Comment not found');
    }

    if ($comment['user_id'] != $user_id) {
        throw new Exception('Unauthorized: You can only delete your own comments');
    }

    // Delete connections bago madelete permanent
    $stmt = $db->prepare("DELETE FROM postvote WHERE comment_id = ?");
    $stmt->execute([$comment_id]);

    // Delete comment
    $stmt = $db->prepare("DELETE FROM comments WHERE comment_id = ?");
    $stmt->execute([$comment_id]);

    echo json_encode(['success' => true, 'message' => 'Comment deleted successfully']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>