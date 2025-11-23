<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['success' => true, 'message' => 'OPTIONS ok']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Failed to connect to database');
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        throw new Exception('No JSON received');
    }

    $comment_id = $data['comment_id'] ?? null;
    $user_id = $data['user_id'] ?? null;
    $vote_type = $data['vote_type'] ?? null;

    if ($comment_id === null || $user_id === null || $vote_type === null) {
        throw new Exception('Missing vote data');
    }

    $voteColumn = $vote_type == 1 ? "up" : "down";

    $stmt = $db->prepare("SELECT vote_type FROM postvote WHERE comment_id=:comment AND user_id=:user");
    $stmt->execute([':comment' => $comment_id, ':user' => $user_id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        $stmt = $db->prepare("INSERT INTO postvote (user_id, comment_id, vote_type) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $comment_id, $vote_type]);
        $stmt = $db->prepare("UPDATE comments SET {$voteColumn}_tally_comment = {$voteColumn}_tally_comment + 1 WHERE comment_id=:comment");
        $stmt->execute([':comment' => $comment_id]);
    } else if ($existing['vote_type'] == $vote_type) {
        $stmt = $db->prepare("DELETE FROM postvote WHERE user_id=:user AND comment_id=:comment");
        $stmt->execute([':user' => $user_id, ':comment' => $comment_id]);
        $stmt = $db->prepare("UPDATE comments SET {$voteColumn}_tally_comment = {$voteColumn}_tally_comment - 1 WHERE comment_id=:comment");
        $stmt->execute([':comment' => $comment_id]);

    } else {
        $oldColumn = $existing['vote_type'] == 1 ? "up" : "down";

        $stmt = $db->prepare("UPDATE postvote SET vote_type=:vote WHERE user_id=:user AND comment_id=:comment");
        $stmt->execute([':vote' => $vote_type, ':user' => $user_id, ':comment' => $comment_id]);

        $stmt = $db->prepare("
            UPDATE comments
            SET {$oldColumn}_tally_comment = {$oldColumn}_tally_comment - 1,
                {$voteColumn}_tally_comment = {$voteColumn}_tally_comment + 1
            WHERE comment_id=:comment
        ");
        $stmt->execute([':comment' => $comment_id]);
    }

    // return sa json
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>