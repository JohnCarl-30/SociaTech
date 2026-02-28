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
    $current_user_id = $_GET['current_user_id'] ?? null;

    if (!$user_id) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    // Fetch user with profile_image
    $stmt = $db->prepare("SELECT username, profile_image FROM users WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

  
    $stmt = $db->prepare("SELECT COUNT(*) AS post_count FROM post WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $postData = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $db->prepare("SELECT COUNT(*) AS follower_count FROM followers WHERE followed_id = :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $followerData = $stmt->fetch(PDO::FETCH_ASSOC);


    $stmt = $db->prepare("SELECT COUNT(*) AS following_count FROM followers WHERE follower_id = :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $followingData = $stmt->fetch(PDO::FETCH_ASSOC);

    
    $isFollowing = false;
    if ($current_user_id && $current_user_id != $user_id) {
        $stmt = $db->prepare("SELECT * FROM followers WHERE follower_id = :follower_id AND followed_id = :followed_id");
        $stmt->bindParam(':follower_id', $current_user_id);
        $stmt->bindParam(':followed_id', $user_id);
        $stmt->execute();
        $isFollowing = $stmt->rowCount() > 0;
    }

    echo json_encode([
        'success' => true,
        'username' => $user['username'],
        'profile_image' => $user['profile_image'],
        'post_count' => (int) ($postData['post_count'] ?? 0),
        'follower_count' => (int) ($followerData['follower_count'] ?? 0),
        'following_count' => (int) ($followingData['following_count'] ?? 0),
        'is_following' => $isFollowing
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>