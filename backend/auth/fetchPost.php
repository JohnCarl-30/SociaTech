<?php 
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

try{
    $db = (new Database()) ->getConnection();
    $stmt = $db->prepare("
    SELECT P.*, u.username, u.profile_image
    FROM post p
    JOIN users u ON p.user_id = u.user_id
    ORDER BY p.post_date DESC");
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'posts' => $posts
    ]);
}catch(Exception $e){
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}






?>