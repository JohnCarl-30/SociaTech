<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $user_id = $_GET['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing user_id'
        ]);
        exit;
    }

    $stmt = $db->prepare("
        SELECT 
            p.post_id,
            p.user_id,
            p.post_title,
            p.post_content,
            p.post_image,
            p.post_category,
            p.post_date,
            p.up_tally_post,
            p.down_tally_post,
            u.username,
            u.profile_image,
            sp.saved_at
        FROM saved_post sp
        INNER JOIN post p ON sp.post_id = p.post_id
        INNER JOIN users u ON p.user_id = u.user_id
        WHERE sp.user_id = ?
        ORDER BY sp.saved_at DESC
    ");

    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format profile images
    foreach ($posts as &$post) {
        if (
            !empty($post['profile_image']) &&
            !str_starts_with($post['profile_image'], 'http')
        ) {
            $post['profile_image'] = 'http://localhost/SociaTech/backend/uploads/profile_images/' . $post['profile_image'];
        }
        if (
            !empty($post['post_image']) &&
            !str_starts_with($post['post_image'], 'http')
        ) {
            $post['post_image'] = 'http://localhost/SociaTech/backend/uploads/post_images/' . $post['post_image'];
        }
    }

    echo json_encode([
        'success' => true,
        'posts' => $posts
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>