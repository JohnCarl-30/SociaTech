<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['success' => true]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Failed to connect to database');
    }

    $comment_id = $_GET['comment_id'] ?? null;

    if (!$comment_id) {
        throw new Exception('comment ID is required');
    }

    // Fetch the post with current tallies
    $stmt = $db->prepare("
        SELECT comment_id, up_tally_comment, down_tally_comment
        FROM comments 
        WHERE comment_id = :comment_id
    ");
    $stmt->execute([':comment_id' => $comment_id]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$comment) {
        throw new Exception('Comment not found');
    }

    echo json_encode([
        'success' => true,
        'comment' => $comment
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>