<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
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

    $post_id = $data['post_id'] ?? null;
    $user_id = $data['user_id'] ?? null;
    $vote_type = $data['vote_type'] ?? null;

  if ($post_id === null || $user_id === null || $vote_type === null) {
    throw new Exception('Missing vote data');
}

// REMOVE VOTE ACTION
if ($vote_type === -1) {
    // delete vote
    $stmt = $db->prepare("DELETE FROM postvote WHERE user_id=:user AND post_id=:post");
    $stmt->execute([':user' => $user_id, ':post' => $post_id]);

   
    $stmt = $db->prepare("SELECT vote_type FROM postvote WHERE user_id=:user AND post_id=:post");
    $stmt->execute([':user' => $user_id, ':post' => $post_id]);
    $old = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($old) {
        $oldColumn = $old['vote_type'] == 1 ? "up" : "down";
        $stmt = $db->prepare("UPDATE post SET {$oldColumn}_tally_post = {$oldColumn}_tally_post - 1 WHERE post_id=:post");
        $stmt->execute([':post' => $post_id]);
    }

    echo json_encode(['success' => true, 'message' => 'Vote removed']);
    exit;
}
    $voteColumn = $vote_type == 1 ? "up" : "down";

    // Check existing vote
    $stmt = $db->prepare("SELECT vote_type FROM postvote WHERE post_id=:post AND user_id=:user");
    $stmt->execute([':post' => $post_id, ':user' => $user_id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        // NEW VOTE
        $stmt = $db->prepare("INSERT INTO postvote (user_id, post_id, vote_type) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $post_id, $vote_type]);

        $stmt = $db->prepare("UPDATE post SET {$voteColumn}_tally_post = {$voteColumn}_tally_post + 1 WHERE post_id=:post");
        $stmt->execute([':post' => $post_id]);

    } else if ($existing['vote_type'] == $vote_type) {
        // REMOVE VOTE
        $stmt = $db->prepare("DELETE FROM postvote WHERE user_id=:user AND post_id=:post");
        $stmt->execute([':user' => $user_id, ':post' => $post_id]);

        $stmt = $db->prepare("UPDATE post SET {$voteColumn}_tally_post = {$voteColumn}_tally_post - 1 WHERE post_id=:post");
        $stmt->execute([':post' => $post_id]);

    } else {
        // SWITCH VOTE
        $oldColumn = $existing['vote_type'] == 1 ? "up" : "down";

        $stmt = $db->prepare("UPDATE postvote SET vote_type=:vote WHERE user_id=:user AND post_id=:post");
        $stmt->execute([':vote' => $vote_type, ':user' => $user_id, ':post' => $post_id]);

        $stmt = $db->prepare("
            UPDATE post
            SET {$oldColumn}_tally_post = {$oldColumn}_tally_post - 1,
                {$voteColumn}_tally_post = {$voteColumn}_tally_post + 1
            WHERE post_id=:post
        ");
        $stmt->execute([':post' => $post_id]);
    }

    // SUCCESS RESPONSE
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // ALWAYS return JSON on error
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

