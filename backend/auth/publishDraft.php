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

    // Get draft details
    $query = $db->prepare("SELECT * FROM draft WHERE id = :draft_id AND user_id = :user_id");
    $query->bindParam(':draft_id', $draft_id, PDO::PARAM_INT);
    $query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $query->execute();

    $draft = $query->fetch(PDO::FETCH_ASSOC);


// Convert draft's relative path to full URL
$draft_image_url = null;
if (!empty($draft['post_image'])) {
    // If already a full URL, use as-is
    if (strpos($draft['post_image'], 'http://') === 0 || strpos($draft['post_image'], 'https://') === 0) {
        $draft_image_url = $draft['post_image'];
    } else {
        // Convert relative path to full URL
        $draft_image_url = "http://localhost/SociaTech/" . $draft['post_image'];
    }
}

// Handle new file upload
if (isset($_FILES['post_image']) && $_FILES['post_image']['error'] === 0) {
    $file = $_FILES['post_image'];
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/SociaTech/uploads/drafts/";
    $newFileName = time() . "_" . $file['name']; // ⬅ Removed "post_" prefix
    $uploadPath = $uploadDir . $newFileName;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $draft_image_url = "http://localhost/SociaTech/uploads/drafts/" . $newFileName;
    }
}
    if (!$draft) {
        echo json_encode([
            "success" => false,
            "error" => "Draft not found"
        ]);
        exit;
    }

    $insertQuery = $db->prepare("
    INSERT INTO post (user_id, post_title, post_content, post_image, post_category, post_date) 
    VALUES (:user_id, :title, :content, :image, :category, NOW())
");

    $insertQuery->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $insertQuery->bindParam(':title', $draft['post_title'], PDO::PARAM_STR);
    $insertQuery->bindParam(':content', $draft['post_content'], PDO::PARAM_STR);
    $insertQuery->bindParam(':image', $draft_image_url, PDO::PARAM_STR);
    $insertQuery->bindParam(':category', $draft['post_category'], PDO::PARAM_STR);

    $insertQuery->execute();

    // ✅ FIXED: Removed :username parameter from DELETE query
    $deleteQuery = $db->prepare("DELETE FROM draft WHERE id = :draft_id AND user_id = :user_id");
    $deleteQuery->bindParam(':draft_id', $draft_id, PDO::PARAM_INT);
    $deleteQuery->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $deleteQuery->execute();

    echo json_encode([
        "success" => true,
        "message" => "Draft published successfully"
    ]);

} catch (PDOException $e) {
    error_log("Database error in publishDraft: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Exception in publishDraft: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => "Exception: " . $e->getMessage()
    ]);
}
?>