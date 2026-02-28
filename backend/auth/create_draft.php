<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

// Verify authentication
$userId = requireAuth();

try {
    $conn = getDBConnection();
    
    // Get input data
    $draft_title = isset($_POST['draft_title']) ? sanitizeInput($_POST['draft_title']) : null;
    $draft_content = isset($_POST['draft_content']) ? sanitizeInput($_POST['draft_content']) : null;
    $draft_category = isset($_POST['draft_category']) ? sanitizeInput($_POST['draft_category']) : null;
    $draft_image = null;
    
    // Handle image upload
    if (isset($_FILES['draft_image']) && $_FILES['draft_image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../uploads/drafts/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_tmp = $_FILES['draft_image']['tmp_name'];
        $file_name = $_FILES['draft_image']['name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        // Validate file type
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($file_ext, $allowed_extensions)) {
            sendError('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.', 400);
        }
        
        // Validate file size (5MB max)
        if ($_FILES['draft_image']['size'] > 5 * 1024 * 1024) {
            sendError('File size too large. Maximum 5MB allowed.', 400);
        }
        
        // Generate unique filename
        $new_filename = 'draft_' . $userId . '_' . time() . '_' . uniqid() . '.' . $file_ext;
        $upload_path = $upload_dir . $new_filename;
        
        // Move uploaded file
        if (move_uploaded_file($file_tmp, $upload_path)) {
            $draft_image = 'uploads/drafts/' . $new_filename;
        } else {
            sendError('Failed to upload image.', 500);
        }
    }
    
    // Insert draft into database
    $stmt = $conn->prepare("
        INSERT INTO draft (user_id, draft_category, draft_title, draft_content, draft_image, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("issss", $userId, $draft_category, $draft_title, $draft_content, $draft_image);
    
    if ($stmt->execute()) {
        $draft_id = $conn->insert_id;
        
        $stmt->close();
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Draft created successfully',
            'draft_id' => $draft_id
        ]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->close();
    }
    sendError('Failed to create draft: ' . $e->getMessage(), 500);
}
?>