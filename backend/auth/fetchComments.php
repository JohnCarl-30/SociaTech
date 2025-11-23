<?php header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';
$post_id = $_GET['post_id'] ?? null;
$sort = $_GET['sort'] ?? 'newest';

if (!$post_id) {
    echo json_encode(['success' => false, 'error' => 'Post ID is required']);
    exit;
}
$orderBy = 'c.comment_date DESC';
if ($sort === 'oldest') {
    $orderBy = 'c.comment_date ASC';
} else if ($sort === 'most_upvoted') {
    $orderBy = '(COALESCE(c.up_tally_comment, 0) - COALESCE(c.down_tally_comment, 0)) DESC, c.comment_date DESC';
}

try {
    $db = (new Database())->getConnection();
     $stmt = $db->prepare(" 
        SELECT 
            c.*, 
            u.username, 
            u.profile_image,
            COALESCE(c.up_tally_comment, 0) as up_tally_comment,
            COALESCE(c.down_tally_comment, 0) as down_tally_comment
        FROM comments c 
        JOIN users u ON c.user_id = u.user_id 
        WHERE c.post_id = ? 
        ORDER BY $orderBy
    ");
     $stmt->execute([$post_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'comments' => $comments]);
} catch (Exception $e) {    
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} 
?>