<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit;
}

// Get the current user's ID if provided
$current_user_id = isset($_GET['current_user_id']) ? $_GET['current_user_id'] : null;

// Check if fetching for a specific user (for profile pages)
$user_id_filter = isset($_GET['user_id']) ? $_GET['user_id'] : null;

try {
    // If fetching posts for a specific user (profile page)
    if ($user_id_filter) {
        $stmt = $conn->prepare("
            SELECT p.*, u.username, u.profile_image 
            FROM post p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.user_id = ?
            ORDER BY p.post_date DESC
        ");
        $stmt->execute([$user_id_filter]);
        
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'posts' => $posts
        ]);
        exit;
    }

    // If no current user, only show public posts
    if (!$current_user_id) {
        $stmt = $conn->prepare("
            SELECT p.*, u.username, u.profile_image 
            FROM post p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.post_visibility = 'public' OR p.post_visibility IS NULL
            ORDER BY p.post_date DESC
        ");
        $stmt->execute();
    } else {
        // Get current user's feed preference
        $userStmt = $conn->prepare("SELECT feed_preference FROM users WHERE user_id = ?");
        $userStmt->execute([$current_user_id]);
        $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
        $feed_preference = $userData['feed_preference'] ?? 'all';

        if ($feed_preference === 'following') {
            // Show only posts from people the user follows + own posts
            $stmt = $conn->prepare("
                SELECT DISTINCT p.*, u.username, u.profile_image 
                FROM post p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN followers f ON p.user_id = f.followed_id AND f.follower_id = ?
                WHERE (
                    p.user_id = ?
                    OR (
                        (p.post_visibility = 'public' OR p.post_visibility IS NULL) 
                        AND f.follower_id IS NOT NULL
                    )
                    OR (
                        p.post_visibility = 'followers' 
                        AND f.follower_id IS NOT NULL
                    )
                )
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$current_user_id, $current_user_id]);
        } else {
            // Show all posts (respecting visibility)
            $stmt = $conn->prepare("
                SELECT DISTINCT p.*, u.username, u.profile_image 
                FROM post p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN followers f ON p.user_id = f.followed_id AND f.follower_id = ?
                WHERE 
                    p.post_visibility = 'public'
                    OR p.post_visibility IS NULL
                    OR (p.post_visibility = 'followers' AND f.follower_id IS NOT NULL)
                    OR p.user_id = ?
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$current_user_id, $current_user_id]);
        }
    }
    
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'posts' => $posts
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    error_log("Fetch posts error: " . $e->getMessage());
}
?>