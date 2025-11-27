<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $input['user_id'] ?? null;
    $post_ids = $input['post_ids'] ?? [];

    if (!$user_id || empty($post_ids)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing user_id or post_ids'
        ]);
        exit;
    }

    $placeholders = str_repeat('?,', count($post_ids) - 1) . '?';
    $stmt = $db->prepare("
        SELECT post_id FROM saved_post
        WHERE user_id = ? AND post_id IN ($placeholders)
    ");

    $params = array_merge([$user_id], $post_ids);
    $stmt->execute($params);
    $savedPosts = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'saved_post_ids' => $savedPosts
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>