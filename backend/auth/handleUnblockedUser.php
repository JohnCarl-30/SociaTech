<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log request method for debugging
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("POST data: " . print_r($_POST, true));
error_log("Raw input: " . file_get_contents('php://input'));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Try to get data from both $_POST and php://input
    $postData = $_POST;

    // If $_POST is empty, try parsing raw input
    if (empty($postData)) {
        parse_str(file_get_contents('php://input'), $postData);
    }

    $blocker_id = $postData['user_id'] ?? $postData['blocker_id'] ?? null;
    $blocked_id = $postData['blocked_user_id'] ?? $postData['blocked_id'] ?? null;

    error_log("Unblock attempt - Blocker: $blocker_id, Blocked: $blocked_id");

    if (!$blocker_id || !$blocked_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields',
            'received' => $postData
        ]);
        exit;
    }

    try {
        $database = new Database();
        $pdo = $database->getConnection();

        if (!$pdo) {
            throw new Exception('Database connection not available');
        }

        // Check if block exists first
        $checkStmt = $pdo->prepare("SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?");
        $checkStmt->execute([$blocker_id, $blocked_id]);
        $existingBlock = $checkStmt->fetch();

        error_log("Existing block record: " . json_encode($existingBlock));

        if (!$existingBlock) {
            echo json_encode(['success' => false, 'message' => 'Block record not found']);
            exit;
        }

        // Delete block record
        $stmt = $pdo->prepare("DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?");
        $stmt->execute([$blocker_id, $blocked_id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'User unblocked successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to unblock user']);
        }
    } catch (PDOException $e) {
        error_log("Database error in handleUnblockedUser.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("Error in handleUnblockedUser.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    // Show what method was actually received
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method',
        'received_method' => $_SERVER['REQUEST_METHOD'],
        'expected' => 'POST'
    ]);
}
?>