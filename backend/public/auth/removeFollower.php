<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
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

    $user_id = $input['user_id'] ?? null;
    $follower_id = $input['follower_id'] ?? null;

    if (empty($user_id) || empty($follower_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID and Follower ID are required'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    // Delete follow relationship (remove follower)
    $stmt = $db->prepare("DELETE FROM followers WHERE follower_id = :follower_id AND followed_id = :followed_id");
    $stmt->bindParam(':follower_id', $follower_id);
    $stmt->bindParam(':followed_id', $user_id);

    if ($stmt->execute() && $stmt->rowCount() > 0) {
        // Get updated follower count
        $countStmt = $db->prepare("SELECT COUNT(*) AS follower_count FROM followers WHERE followed_id = :followed_id");
        $countStmt->bindParam(':followed_id', $user_id);
        $countStmt->execute();
        $countData = $countStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Follower removed successfully',
            'follower_count' => (int) $countData['follower_count']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'This user is not following you'
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