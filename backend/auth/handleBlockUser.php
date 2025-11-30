<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("POST data: " . print_r($_POST, true));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? $_POST['blocker_id'] ?? null;
    $blocked_user_id = $_POST['blocked_user_id'] ?? $_POST['blocked_id'] ?? null;

    error_log("user_id: " . $user_id);
    error_log("blocked_user_id: " . $blocked_user_id);

    if (!$user_id || !$blocked_user_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields',
            'received' => [
                'user_id' => $user_id,
                'blocked_user_id' => $blocked_user_id,
                'all_post' => $_POST
            ]
        ]);
        exit;
    }

    if ($user_id == $blocked_user_id) {
        echo json_encode(['success' => false, 'message' => 'Cannot block yourself']);
        exit;
    }

    try {
        $database = new Database();
        $pdo = $database->getConnection();

        if (!$pdo) {
            throw new Exception('Database connection not available');
        }

        // Check if already blocked
        $checkStmt = $pdo->prepare("SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?");
        $checkStmt->execute([$user_id, $blocked_user_id]);

        if ($checkStmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'User is already blocked']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO blocked_users (blocker_id, blocked_id, blocked_at) VALUES (?, ?, NOW())");
        $stmt->execute([$user_id, $blocked_user_id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'User blocked successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to block user']);
        }
    } catch (PDOException $e) {
        error_log("Database error in handleBlockUser.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("Error in handleBlockUser.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {

    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method',
        'received_method' => $_SERVER['REQUEST_METHOD'],
        'expected' => 'POST'
    ]);
}
?>