<?php 
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

$user_id = $_POST['user_id'] ?? null;
$post_category = $_POST['post_category'] ?? null;
$post_title = $_POST['post_title'] ?? null;
$post_content = $_POST['post_content'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // ✅ VERIFY USER EXISTS FIRST
    $checkUser = $db->prepare("SELECT user_id FROM users WHERE user_id = ?");
    $checkUser->execute([$user_id]);
    
    if ($checkUser->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid user ID. Please log in again.']);
        exit;
    }

    $post_image_url = null;
    if (isset($_FILES['post_image']) && $_FILES['post_image']['error'] === 0) {
        $file = $_FILES['post_image'];
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/SociaTech/post_images/";
        $newFileName = "post_" . time() . "_" . $file['name'];
        $uploadPath = $uploadDir . $newFileName;
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $post_image_url = "http://localhost/SociaTech/post_images/" . $newFileName;
        }
    }

    $stmt = $db->prepare("INSERT INTO post (user_id,post_category,post_title,post_content,post_image,post_date) VALUES (?,?,?,?,?,NOW())");
    $stmt->execute([$user_id, $post_category, $post_title, $post_content, $post_image_url]);

    echo json_encode(['success' => true, 'message' => 'Post created successfully']);
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>