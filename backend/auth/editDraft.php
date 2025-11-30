<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php-error.log');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ob_start();

try {
    $connectionFile = __DIR__ . "/../config/database.php";

    if (!file_exists($connectionFile)) {
        throw new Exception("Database connection file not found");
    }

    require_once $connectionFile;

    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

} catch (Exception $e) {
    ob_end_clean();
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed"
    ]);
    exit;
}

// Parse input
$input = $_POST;
$receivedFiles = $_FILES;

if (empty($_POST)) {
    $rawInput = file_get_contents('php://input');
    $decoded = json_decode($rawInput, true);
    if ($decoded && json_last_error() === JSON_ERROR_NONE) {
        $input = $decoded;
    }
}

// Validate input
if (!isset($input["draft_id"]) || !isset($input["user_id"])) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing required fields: draft_id and user_id"
    ]);
    exit;
}

$draft_id = intval($input["draft_id"]);
$user_id = intval($input["user_id"]);

// Verify ownership
try {
    $checkStmt = $conn->prepare("SELECT id, post_image FROM draft WHERE id = :draft_id AND user_id = :user_id");
    $checkStmt->bindParam(':draft_id', $draft_id, PDO::PARAM_INT);
    $checkStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $checkStmt->execute();

    $existingDraft = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingDraft) {
        ob_end_clean();
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "error" => "Draft not found or you don't have permission to edit it"
        ]);
        exit;
    }

} catch (Exception $e) {
    ob_end_clean();
    error_log("Error checking draft ownership: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to verify draft ownership"
    ]);
    exit;
}

// Prepare update fields
$updateFields = [];
$params = [':draft_id' => $draft_id, ':user_id' => $user_id];

if (isset($input["post_category"])) {
    $updateFields[] = "post_category = :category";
    $params[':category'] = trim($input["post_category"]);
}

if (isset($input["post_title"])) {
    $updateFields[] = "post_title = :title";
    $params[':title'] = trim($input["post_title"]);
}

if (isset($input["post_content"])) {
    $updateFields[] = "post_content = :content";
    $params[':content'] = trim($input["post_content"]);
}

// Handle image upload
if (!empty($receivedFiles["post_image"]["name"])) {
    try {
        $uploadDir = __DIR__ . "/../../uploads/drafts/";

        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                throw new Exception("Failed to create upload directory");
            }
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $fileType = $receivedFiles["post_image"]["type"];

        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception("Invalid file type. Only images allowed.");
        }

        if ($receivedFiles["post_image"]["size"] > 5 * 1024 * 1024) {
            throw new Exception("File too large. Maximum 5MB.");
        }

        $fileName = time() . "_" . preg_replace("/[^a-zA-Z0-9._-]/", "", basename($receivedFiles["post_image"]["name"]));
        $targetPath = $uploadDir . $fileName;

        if (!move_uploaded_file($receivedFiles["post_image"]["tmp_name"], $targetPath)) {
            throw new Exception("Failed to move uploaded file");
        }

        // Delete old image if exists
        if ($existingDraft['post_image']) {
            $oldImagePath = __DIR__ . "/../../" . $existingDraft['post_image'];
            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        $image_path = "uploads/drafts/" . $fileName;
        $updateFields[] = "post_image = :image_path";
        $params[':image_path'] = $image_path;

    } catch (Exception $e) {
        ob_end_clean();
        error_log("Image upload error: " . $e->getMessage());
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

// Check if there are fields to update
if (empty($updateFields)) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "No fields to update"
    ]);
    exit;
}

// Update draft
try {
    $sql = "UPDATE draft SET " . implode(", ", $updateFields) . " WHERE id = :draft_id AND user_id = :user_id";
    $stmt = $conn->prepare($sql);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to update draft");
    }

    ob_end_clean();
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Draft updated successfully"
    ]);

} catch (Exception $e) {
    ob_end_clean();
    error_log("Database update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to update draft"
    ]);
}