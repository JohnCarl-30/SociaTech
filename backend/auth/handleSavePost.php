<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

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
        // Unsave the post
        $deleteStmt = $db->prepare("
            DELETE FROM saved_post
            WHERE user_id = ? AND post_id = ?
        ");
        $deleteStmt->execute([$user_id, $post_id]);

        echo json_encode([
            'success' => true,
            'action' => 'unsaved',
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
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>