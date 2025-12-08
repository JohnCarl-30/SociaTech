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
    $user_id = $_POST['user_id'] ?? null;
    $followed_id = $_POST['followed_id'] ?? null;

    if (empty($user_id) || empty($followed_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID and Followed ID are required'
        ]);
        exit;
    }

    if ($user_id == $followed_id) {
        echo json_encode([
            'success' => false,
            'message' => 'You cannot follow yourself'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    // Check if already following
    $checkStmt = $db->prepare("SELECT * FROM followers WHERE follower_id = :follower_id AND followed_id = :followed_id");
    $checkStmt->bindParam(':follower_id', $user_id);
    $checkStmt->bindParam(':followed_id', $followed_id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'You are already following this user'
        ]);
        exit;
    }
    
    // Insert follow relationship
    $stmt = $db->prepare("INSERT INTO followers (follower_id, followed_id, followed_at) VALUES (:follower_id, :followed_id, NOW())");
    $stmt->bindParam(':follower_id', $user_id);
    $stmt->bindParam(':followed_id', $followed_id);
    
    if ($stmt->execute()) {
        // Get updated follower count
        $countStmt = $db->prepare("SELECT COUNT(*) AS follower_count FROM followers WHERE followed_id = :followed_id");
        $countStmt->bindParam(':followed_id', $followed_id);
        $countStmt->execute();
        $countData = $countStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Successfully followed user',
            'follower_count' => (int) $countData['follower_count']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to follow user'
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