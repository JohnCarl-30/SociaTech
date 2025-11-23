<?php header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

$user_id = $_POST['user_id'] ?? null;
$post_id = $_POST['post_id'] ?? null;
$comment_content = $_POST['comment_content'] ?? '';
$comment_image = $_FILES['comment_image'] ?? null;
if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit;
}
if (!$post_id) {
    echo json_encode(['success' => false, 'error' => 'Post ID is required']);
    exit;
}
if (empty(trim($comment_content)) && (!$comment_image || $comment_image['error'] !== 0)) {
    echo json_encode(['success' => false, 'message' => 'Comment content or image is required']);
    exit;
}

try { 
    $database = new Database();
    $db = $database->getConnection();
    $checkUser = $db->prepare("SELECT user_id FROM users WHERE user_id = ?");
    $checkUser->execute([$user_id]);
    if ($checkUser->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid user ID. Please log in again.']);
        exit;
    }
    $comment_image_url = null;
    if ($comment_image && $comment_image['error'] === 0) {
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/SociaTech/comment_images/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $newFileName = "comment_" . time() . "_" . $comment_image['name'];
        $uploadPath = $uploadDir . $newFileName;
        if (move_uploaded_file($comment_image['tmp_name'], $uploadPath)) {
            $comment_image_url = "http://localhost/SociaTech/comment_images/" . $newFileName;
        }
    }
    $stmt = $db->prepare("INSERT INTO comments (user_id, post_id, comment_content, comment_image, comment_date) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$user_id, $post_id, $comment_content, $comment_image_url]);
    echo json_encode(['success' => true, 'message' => 'Comment created successfully']);
} catch (Exception $e) {
      echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} ?>

