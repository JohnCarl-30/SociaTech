<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');


require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

try {
    $query = "SELECT 
                n.*,
                n.related_post_id as post_id,
                n.related_comment_id as comment_id,
                u.username as actor_username,
                u.profile_image as actor_profile_image,
                p.post_title,
                c.comment_content
              FROM notifications n
              LEFT JOIN users u ON n.actor_id = u.user_id
              LEFT JOIN post p ON n.related_post_id = p.post_id
              LEFT JOIN comments c ON n.related_comment_id = c.comment_id
              WHERE n.user_id = :user_id
              ORDER BY n.created_at DESC
              LIMIT 50";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    

    $countQuery = "SELECT COUNT(*) as unread_count 
                   FROM notifications 
                   WHERE user_id = :user_id AND is_read = 0";
    $countStmt = $db->prepare($countQuery);
    $countStmt->bindParam(':user_id', $user_id);
    $countStmt->execute();
    $countResult = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "notifications" => $notifications,
        "unread_count" => $countResult['unread_count']
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>