<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

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
    $comment_content = $data['comment_content'] ?? null;

    if ($comment_id === null || $user_id === null) {
        throw new Exception('Missing comment_id or user_id');
    }

    if ($comment_content === null || trim($comment_content) === '') {
        throw new Exception('Comment content cannot be empty');
    }

    // Verify user
    $stmt = $db->prepare("SELECT user_id FROM comments WHERE comment_id = ?");
    $stmt->execute([$comment_id]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$comment) {
        throw new Exception('Comment not found');
    }

    if ($comment['user_id'] != $user_id) {
        throw new Exception('Unauthorized: You can only edit your own comments');
    }

    // Update the comment
    $stmt = $db->prepare("UPDATE comments SET comment_content = ? WHERE comment_id = ?");
    $stmt->execute([$comment_content, $comment_id]);

    echo json_encode(['success' => true, 'message' => 'Comment updated successfully']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>