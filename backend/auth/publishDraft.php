<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
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

    // Get draft details
    $query = $db->prepare("SELECT * FROM draft WHERE id = :draft_id AND user_id = :user_id");
    $query->bindParam(':draft_id', $draft_id, PDO::PARAM_INT);
    $query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $query->execute();

    $draft = $query->fetch(PDO::FETCH_ASSOC);

    if (!$draft) {
        echo json_encode([
            "success" => false,
            "error" => "Draft not found"
        ]);
        exit;
    }

    // Get username from users table if not in draft
    $username = $draft['username'] ?? null;
    
    if (empty($username)) {
        $userQuery = $db->prepare("SELECT username FROM users WHERE user_id = :user_id");
        $userQuery->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $userQuery->execute();
        $userData = $userQuery->fetch(PDO::FETCH_ASSOC);
        $username = $userData['username'] ?? null;
    }

    // Insert into posts table
    $insertQuery = $db->prepare("INSERT INTO post (user_id, post_title, post_content, post_image, post_category, username, created_at) VALUES (:user_id, :title, :content, :image, :category, :username, NOW())");

    $insertQuery->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $insertQuery->bindParam(':title', $draft['post_title']);
    $insertQuery->bindParam(':content', $draft['post_content']);
    $insertQuery->bindParam(':image', $draft['post_image']);
    $insertQuery->bindParam(':category', $draft['post_category']);
    $insertQuery->bindParam(':username', $username);

    $insertQuery->execute();

    // Delete draft
    $deleteQuery = $db->prepare("DELETE FROM draft WHERE id = :draft_id AND user_id = :user_id");
    $deleteQuery->bindParam(':draft_id', $draft_id, PDO::PARAM_INT);
    $deleteQuery->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $deleteQuery->execute();

    echo json_encode([
        "success" => true,
        "message" => "Draft published successfully"
    ]);

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