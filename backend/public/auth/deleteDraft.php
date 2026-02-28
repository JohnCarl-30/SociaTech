<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once '../config/database.php';
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['draft_id']) || !isset($input['user_id'])) {
        echo json_encode([
            "success" => false,
            "error" => "Missing required parameters"
        ]);
        exit;
    }
    
    $draft_id = intval($input['draft_id']);
    $user_id = intval($input['user_id']);
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        echo json_encode([
            "success" => false,
            "error" => "Database connection failed"
        ]);
        exit;
    }
    
    // Delete draft
    $query = $db->prepare("DELETE FROM draft WHERE id = :draft_id AND user_id = :user_id");
    $query->bindParam(':draft_id', $draft_id, PDO::PARAM_INT);
    $query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    
    $query->execute();
    
    if ($query->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Draft deleted successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Draft not found or already deleted"
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Exception: " . $e->getMessage()
    ]);
}
?>