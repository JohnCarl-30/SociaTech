<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    $user_id = $_GET['user_id'] ?? null;

    if (empty($user_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    // Get all users that this user is following
    $stmt = $db->prepare("
        SELECT 
            u.user_id,
            u.username,
            u.fullname,
            u.profile_image,
            f.followed_at
        FROM followers f
        INNER JOIN users u ON f.followed_id = u.user_id
        WHERE f.follower_id = :user_id
        ORDER BY f.followed_at DESC
    ");

    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $following = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'following' => $following,
        'count' => count($following)
    ]);

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