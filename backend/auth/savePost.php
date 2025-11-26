<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS')
    exit(0);

require_once '../config/database.php';

$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : null;
$post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : null;

if (!$user_id || !$post_id) {
    echo json_encode(['success' => false, 'message' => 'Missing user_id or post_id']);
    exit;
}

// Check if already saved
$checkSql = "SELECT id FROM saved_posts WHERE user_id = ? AND post_id = ?";
$stmt = $conn->prepare($checkSql);
$stmt->bind_param("ii", $user_id, $post_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // Already saved → remove
    $stmt->close();
    $delSql = "DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?";
    $stmt = $conn->prepare($delSql);
    $stmt->bind_param("ii", $user_id, $post_id);
    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'Post removed from saved']);
    exit;
}

// Not saved → add
$stmt->close();
$insertSql = "INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)";
$stmt = $conn->prepare($insertSql);
$stmt->bind_param("ii", $user_id, $post_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Post saved successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save post']);
}
?>