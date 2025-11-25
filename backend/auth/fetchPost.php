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
    
    $db = (new Database())->getConnection();
    
    if ($user_id) {
        // Fetch posts for specific user from "post" table
        $stmt = $db->prepare("
            SELECT p.*, u.username, u.profile_image
            FROM post p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.user_id = :user_id
            ORDER BY p.post_date DESC
        ");
        $stmt->bindParam(':user_id', $user_id);

    } else {
        // Fetch all posts
        $stmt = $db->prepare("
            SELECT p.*, u.username, u.profile_image
            FROM post p
            JOIN users u ON p.user_id = u.user_id
            ORDER BY p.post_date DESC
        ");
    }
    
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'posts' => $posts
    ]);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
