<?php
// Prevent any output before JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST');
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


$user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
$current_password = isset($_POST['current_password']) ? $_POST['current_password'] : null;
$new_password = isset($_POST['new_password']) ? $_POST['new_password'] : null;


if (!$user_id || !$current_password || !$new_password) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

try {
    
    $stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    $stored_password = $user['password'];
    
    // Verify current password
    if (!password_verify($current_password, $stored_password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Current password is incorrect'
        ]);
        exit;
    }
    
 
    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);
    
  
    $update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
    
    if ($update_stmt->execute([$new_password_hash, $user_id])) {
        echo json_encode([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update password'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred'
    ]);
  
    error_log("Password change error: " . $e->getMessage());
}
?>