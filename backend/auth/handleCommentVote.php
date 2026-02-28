<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['success' => true, 'message' => 'OPTIONS ok']);
    exit;
}

try {
    // Initialize Database and get PDO connection
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Failed to connect to database');
    }

    // Get input data
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        throw new Exception('No JSON received');
    }

    $comment_id = $data['comment_id'] ?? null;
    $user_id = $data['user_id'] ?? null;
    $vote_type = $data['vote_type'] ?? null;

    if ($comment_id === null || $user_id === null) {
        throw new Exception('Missing vote data');
    }

    // Check existing vote
    $stmt = $db->prepare("SELECT vote_type FROM commentvote WHERE comment_id=:comment AND user_id=:user");
    $stmt->execute([':comment' => $comment_id, ':user' => $user_id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        // NEW VOTE - No existing vote, insert new one
        if ($vote_type !== null) {
            $stmt = $db->prepare("INSERT INTO commentvote (user_id, comment_id, vote_type) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $comment_id, $vote_type]);

            $voteColumn = $vote_type == 1 ? "up_tally_comment" : "down_tally_comment";
            $stmt = $db->prepare("UPDATE comments SET {$voteColumn} = {$voteColumn} + 1 WHERE comment_id=:comment");
            $stmt->execute([':comment' => $comment_id]);
        }

    } else if ($vote_type === null) {
        // REMOVE VOTE - User is removing their vote
        $oldColumn = $existing['vote_type'] == 1 ? "up_tally_comment" : "down_tally_comment";

        $stmt = $db->prepare("DELETE FROM commentvote WHERE user_id=:user AND comment_id=:comment");
        $stmt->execute([':user' => $user_id, ':comment' => $comment_id]);

        $stmt = $db->prepare("UPDATE comments SET {$oldColumn} = {$oldColumn} - 1 WHERE comment_id=:comment");
        $stmt->execute([':comment' => $comment_id]);

    } else if ($existing['vote_type'] != $vote_type) {
        // SWITCH VOTE - User is changing from up to down or vice versa
        $oldColumn = $existing['vote_type'] == 1 ? "up_tally_comment" : "down_tally_comment";
        $newColumn = $vote_type == 1 ? "up_tally_comment" : "down_tally_comment";

        $stmt = $db->prepare("UPDATE commentvote SET vote_type=:vote WHERE user_id=:user AND comment_id=:comment");
        $stmt->execute([':vote' => $vote_type, ':user' => $user_id, ':comment' => $comment_id]);

        $stmt = $db->prepare("
            UPDATE comments
            SET {$oldColumn} = {$oldColumn} - 1,
                {$newColumn} = {$newColumn} + 1
            WHERE comment_id=:comment
        ");
        $stmt->execute([':comment' => $comment_id]);
    }
    // If vote_type matches existing vote_type, do nothing (already voted the same way)

    // SUCCESS RESPONSE
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // ALWAYS return JSON on error
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>