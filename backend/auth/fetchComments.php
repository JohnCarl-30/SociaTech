<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../config/database.php";

try {
    $db = (new Database())->getConnection();

    $user_id = $_POST['user_id'] ?? null;
    $post_id = $_POST['post_id'] ?? null;
    $comment_text = $_POST['comment_text'] ?? "";

    if (!$user_id || !$post_id || $comment_text === "") {
        echo json_encode(["success" => false, "message" => "Missing data"]);
        exit;
    }

    // Handle image upload
    $imagePath = null;
    if (!empty($_FILES['comment_image']['name'])) {
        $targetDir = "../uploads/comments/";
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $fileName = time() . "_" . basename($_FILES["comment_image"]["name"]);
        $targetFile = $targetDir . $fileName;

        if (move_uploaded_file($_FILES["comment_image"]["tmp_name"], $targetFile)) {
            $imagePath = "uploads/comments/" . $fileName;
        }
    }

    $stmt = $db->prepare('INSERT INTO comments (post_id,user_id,comment_content,comment_image,comment_date) VALUES (?,?,?,?, NOW())');
    $stmt->execute([$post_id, $user_id, $comment_text, $imagePath]);

    // Fetch the newly created comment with user data
    $newCommentId = $db->lastInsertId();
    $stmt = $db->prepare("
        SELECT c.*, u.username, u.profile_image 
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.comment_id = ?
    ");
    $stmt->execute([$newCommentId]);
    $newComment = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "message" => "Comment added", "comment" => $newComment]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
