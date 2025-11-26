<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    $user_id = $_GET['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    if (!$db) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection not established'
        ]);
        exit;
    }

    // Fetch saved posts with user info
    $stmt = $db->prepare("
        SELECT p.*, u.username, u.profile_image
        FROM saved_posts sp
        INNER JOIN post p ON sp.post_id = p.post_id
        INNER JOIN users u ON p.user_id = u.user_id
        WHERE sp.user_id = :user_id
        ORDER BY sp.saved_at DESC
    ");
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'posts' => $posts
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>