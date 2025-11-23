<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

$post_id = $_POST['post_id'] ?? null;
$user_id = $_POST['user_id'] ?? null;
$post_title = $_POST['post_title'] ?? null;
$post_content = $_POST['post_content'] ?? null;
$post_category = $_POST['post_category'] ?? null;
$remove_image = $_POST['remove_image'] ?? false;

if (!$post_id || !$user_id) {
    echo json_encode(['success' => false, 'error' => 'Post ID and User ID are required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify the post belongs to the user
    $checkStmt = $db->prepare("SELECT user_id, post_image FROM post WHERE post_id = ?");
    $checkStmt->execute([$post_id]);
    $existingPost = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingPost) {
        echo json_encode(['success' => false, 'error' => 'Post not found']);
        exit;
    }

    if ($existingPost['user_id'] != $user_id) {
        echo json_encode(['success' => false, 'error' => 'You can only edit your own posts']);
        exit;
    }

    // Handle image update
    $post_image_url = $existingPost['post_image'];

    if ($remove_image === 'true') {
        // User wants to remove the image
        $post_image_url = null;
    } else if (isset($_FILES['post_image']) && $_FILES['post_image']['error'] === 0) {
        // User uploaded a new image
        $file = $_FILES['post_image'];
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/SociaTech/post_images/";
        $newFileName = "post_" . time() . "_" . $file['name'];
        $uploadPath = $uploadDir . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $post_image_url = "http://localhost/SociaTech/post_images/" . $newFileName;
        }
    }

    // Update the post
    $stmt = $db->prepare("
        UPDATE post 
        SET post_title = ?, 
            post_content = ?, 
            post_category = ?, 
            post_image = ?
        WHERE post_id = ? AND user_id = ?
    ");

    $stmt->execute([
        $post_title,
        $post_content,
        $post_category,
        $post_image_url,
        $post_id,
        $user_id
    ]);

    echo json_encode(['success' => true, 'message' => 'Post updated successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>