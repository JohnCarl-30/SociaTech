<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['success' => true]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db)
        throw new Exception('Database connection failed');

    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = $data['post_id'] ?? null;
    $user_id = $data['user_id'] ?? null;
    $post_title = $data['post_title'] ?? null;
    $post_content = $data['post_content'] ?? '';
    $post_category = $data['post_category'] ?? null;

    if (!$post_id || !$user_id || !$post_title || !$post_category) {
        throw new Exception('Missing required fields');
    }

    // Verify post belongs to user
    $stmt = $db->prepare("SELECT user_id FROM posts WHERE post_id = ?");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$post)
        throw new Exception('Post not found');
    if ($post['user_id'] != $user_id)
        throw new Exception('Unauthorized');

    // Update post
    $stmt = $db->prepare("
        UPDATE posts 
        SET post_title = ?, post_content = ?, post_category = ? 
        WHERE post_id = ?
    ");
    $stmt->execute([$post_title, $post_content, $post_category, $post_id]);

    echo json_encode(['success' => true, 'message' => 'Post updated successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>