<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');


require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->type)) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $query = "INSERT INTO notifications
              (user_id, type, message, related_post_id, related_comment_id, actor_id, is_read, created_at)
              VALUES
              (:user_id, :type, :message, :related_post_id, :related_comment_id, :actor_id, 0, NOW())
              RETURNING notification_id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->bindParam(':type', $data->type);
    $stmt->bindParam(':message', $data->message);
    $stmt->bindParam(':related_post_id', $data->related_post_id);
    $stmt->bindParam(':related_comment_id', $data->related_comment_id);
    $stmt->bindParam(':actor_id', $data->actor_id);
    
    if ($stmt->execute()) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            "success" => true,
            "message" => "Notification created successfully",
            "notification_id" => $row['notification_id']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to create notification"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>