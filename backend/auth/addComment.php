<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header("Content-Type: application/json");
require_once "../config/database.php";

try {
    $db = (new Database())->getConnection();
    $post_id = $_POST['post_id'] ?? null;

    if (!$post_id || $user_id) {
        echo json_encode(["success" => false, "message" => "post_id missing"]);
        exit;
    }

    $stmt = $db->prepare("
        SELECT c.*, u.username, u.profile_image 
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ");
    $stmt->execute([$post_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "comments" => $comments]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
