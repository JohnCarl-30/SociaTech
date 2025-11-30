<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');


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

$user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
$post_visibility = isset($_POST['post_visibility']) ? $_POST['post_visibility'] : null;
$feed_preference = isset($_POST['feed_preference']) ? $_POST['feed_preference'] : null;

if (!$user_id || !$post_visibility || !$feed_preference) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

// Validate values
$valid_visibility = ['public', 'followers'];
$valid_preference = ['all', 'following'];

if (!in_array($post_visibility, $valid_visibility) || !in_array($feed_preference, $valid_preference)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid settings values'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE users SET post_visibility = ?, feed_preference = ? WHERE user_id = ?");
    
    if ($stmt->execute([$post_visibility, $feed_preference, $user_id])) {
        echo json_encode([
            'success' => true,
            'message' => 'Visibility settings updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update settings'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred'
    ]);
    error_log("Update visibility settings error: " . $e->getMessage());
}
?>