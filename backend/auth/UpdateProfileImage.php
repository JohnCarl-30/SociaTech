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
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $user_id = $_POST['user_id'] ?? null;

    if (!$user_id) {
        throw new Exception('User ID is required');
    }

    if (!isset($_FILES['profile_image'])) {
        throw new Exception('No image file provided');
    }

    $file = $_FILES['profile_image'];
    
    // Validate file
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.');
    }

    // Check file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new Exception('File size must be less than 5MB');
    }

    $uploadDir = '../uploads/profile_images/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . '_' . time() . '.' . $extension;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception('Failed to upload file');
    }

    $imageUrl = 'http://localhost/SociaTech/backend/uploads/profile_images/' . $fileName;

    $db = (new Database())->getConnection();
    
    $stmt = $db->prepare("UPDATE users SET profile_image = :profile_image WHERE user_id = :user_id");
    $stmt->bindParam(':profile_image', $imageUrl);
    $stmt->bindParam(':user_id', $user_id);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update database');
    }

    echo json_encode([
        'success' => true,
        'profile_image' => $imageUrl,
        'message' => 'Profile image updated successfully'
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>