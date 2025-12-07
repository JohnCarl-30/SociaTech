<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    // Get JSON data from request body
    $input = json_decode(file_get_contents('php://input'), true);

    $user_id = $input['user_id'] ?? null;  // The current user who wants to remove someone from their following
    $following_id = $input['following_id'] ?? null;  // The user to be removed from following list

    if (empty($user_id) || empty($following_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID and Following ID are required'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    // Delete follow relationship (current user stops following the target user)
    $stmt = $db->prepare("DELETE FROM followers WHERE follower_id = :follower_id AND followed_id = :followed_id");
    $stmt->bindParam(':follower_id', $user_id);
    $stmt->bindParam(':followed_id', $following_id);

    if ($stmt->execute() && $stmt->rowCount() > 0) {
        // Get updated following count for the current user
        $countStmt = $db->prepare("SELECT COUNT(*) AS following_count FROM followers WHERE follower_id = :follower_id");
        $countStmt->bindParam(':follower_id', $user_id);
        $countStmt->execute();
        $countData = $countStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Removed from following successfully',
            'following_count' => (int) $countData['following_count']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'You are not following this user'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>