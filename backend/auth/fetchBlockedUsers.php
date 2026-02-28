<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_GET['user_id'] ?? null;

    error_log("fetchBlockedUsers - user_id: " . $user_id);

    if (!$user_id) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required',
            'blocked_users' => []
        ]);
        exit;
    }

    try {
        $database = new Database();
        $pdo = $database->getConnection();

        if (!$pdo) {
            throw new Exception('Database connection not available');
        }

        $stmt = $pdo->prepare("
            SELECT 
                bu.blocked_id as user_id,
                bu.blocked_at,
                u.username,
                u.fullname,
                u.profile_image,
                u.bio
            FROM blocked_users bu
            INNER JOIN users u ON bu.blocked_id = u.user_id
            WHERE bu.blocker_id = ?
            ORDER BY bu.blocked_at DESC
        ");
        $stmt->execute([$user_id]);

        $blockedUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'blocked_users' => $blockedUsers,
            'count' => count($blockedUsers)
        ]);

    } catch (PDOException $e) {
        error_log("Database error in fetchBlockedUsers.php: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage(),
            'blocked_users' => []
        ]);
    } catch (Exception $e) {
        error_log("Error in fetchBlockedUsers.php: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred: ' . $e->getMessage(),
            'blocked_users' => []
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method',
        'blocked_users' => []
    ]);
}
?>