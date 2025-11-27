<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $user_id = $_POST['user_id'] ?? null;
    $post_id = $_POST['post_id'] ?? null;

    if (!$user_id || !$post_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing user_id or post_id'
        ]);
        exit;
    }

    // Check if post is already saved
    $checkStmt = $db->prepare("
        SELECT save_id FROM saved_post
        WHERE user_id = ? AND post_id = ?
    ");
    $checkStmt->execute([$user_id, $post_id]);
    $exists = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($exists) {
        // Unsave the post - FIXED: changed saved_posts to saved_post
        $deleteStmt = $db->prepare("
            DELETE FROM saved_post
            WHERE user_id = ? AND post_id = ?
        ");
        $deleteStmt->execute([$user_id, $post_id]);

        echo json_encode([
            'success' => true,
            'action' => 'unsaved',
            'message' => 'Post unsaved successfully'
        ]);
    } else {
        // Save the post
        $insertStmt = $db->prepare("
            INSERT INTO saved_post (user_id, post_id) 
            VALUES (?, ?)
        ");
        $insertStmt->execute([$user_id, $post_id]);

        echo json_encode([
            'success' => true,
            'action' => 'saved',
            'message' => 'Post saved successfully'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>