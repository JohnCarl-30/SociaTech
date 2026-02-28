<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['success' => true]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Failed to connect to database');
    }

    $post_id = $_GET['post_id'] ?? null;

    if (!$post_id) {
        throw new Exception('Post ID is required');
    }

    // Fetch the post with current tallies
    $stmt = $db->prepare("
          SELECT p.*, u.username, u.profile_image
            FROM post p
            JOIN users u ON p.user_id = u.user_id
        WHERE post_id = :post_id
    ");
    $stmt->execute([':post_id' => $post_id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        throw new Exception('Post not found');
    }

    echo json_encode([
        'success' => true,
        'post' => $post
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>