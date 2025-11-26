<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');


require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id)) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

try {
    // Mark single notification as read
    if (isset($data->notification_id)) {
        $query = "UPDATE notifications 
                  SET is_read = 1 
                  WHERE notification_id = :notification_id 
                  AND user_id = :user_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':notification_id', $data->notification_id);
        $stmt->bindParam(':user_id', $data->user_id);
    } 
    // Mark all notifications as read
    else {
        $query = "UPDATE notifications 
                  SET is_read = 1 
                  WHERE user_id = :user_id 
                  AND is_read = 0";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $data->user_id);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Notification(s) marked as read"
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update notification"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>