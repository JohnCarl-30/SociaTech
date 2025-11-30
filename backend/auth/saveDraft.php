<?php
// ===== MUST BE FIRST LINE - NO WHITESPACE BEFORE THIS =====
ini_set('display_errors', 0);  // ✅ This prevents HTML in JSON response
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php-error.log');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ob_start();

// ===== Debug: Log everything we receive =====
error_log("=== SAVEDRAFT DEBUG ===");
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));
error_log("RAW input: " . file_get_contents('php://input'));

// ===== Connect to database using PDO =====
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
        "error" => "Database connection failed: " . $e->getMessage()
    ]);
    exit;
}

// ===== Parse input (handle both JSON and form-data) =====
$input = $_POST;
$receivedFiles = $_FILES;

// If no POST data, try parsing raw input
if (empty($_POST)) {
    $rawInput = file_get_contents('php://input');
    error_log("Attempting to parse raw input, length: " . strlen($rawInput));

    // Try JSON decode
    $decoded = json_decode($rawInput, true);
    if ($decoded && json_last_error() === JSON_ERROR_NONE) {
        $input = $decoded;
        error_log("Successfully parsed as JSON");
    } else {
        // Try parsing as multipart form data manually
        error_log("Not valid JSON, attempting form-data parse");

        // Check if it's multipart/form-data
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'multipart/form-data') !== false) {
            error_log("Content type is multipart/form-data but POST is empty - this is a PHP configuration issue");
        }
    }
}

// ===== Validate input =====
if (!isset($input["user_id"]) || !isset($input["post_category"]) || !isset($input["post_title"])) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing required fields: user_id, post_category, or post_title",
        "debug" => [
            "received_keys" => array_keys($input),
            "file_keys" => array_keys($receivedFiles),
            "content_type" => $_SERVER['CONTENT_TYPE'] ?? 'not set',
            "request_method" => $_SERVER['REQUEST_METHOD'],
            "post_empty" => empty($_POST),
            "files_empty" => empty($_FILES)
        ]
    ]);
    exit;
}

$user_id = intval($input["user_id"]);
$username = isset($input["username"]) ? trim($input["username"]) : null;
$category = trim($input["post_category"]);
$title = trim($input["post_title"]);
$content = isset($input["post_content"]) ? trim($input["post_content"]) : "";
$image_path = null;

// ===== Handle image upload =====
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

        $image_path = "uploads/drafts/" . $fileName;

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

// ===== Save to database using PDO =====
try {
    $stmt = $conn->prepare("
    INSERT INTO draft (user_id, post_category, post_title, post_content, post_image, username, created_at)
    VALUES (:user_id, :category, :title, :content, :image_path, :username, NOW())
");
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':category', $category, PDO::PARAM_STR);
    $stmt->bindParam(':title', $title, PDO::PARAM_STR);
    $stmt->bindParam(':content', $content, PDO::PARAM_STR);
    $stmt->bindParam(':image_path', $image_path, PDO::PARAM_STR);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);

    if (!$stmt->execute()) {
        throw new Exception("Failed to save draft");
    }

    $draft_id = $conn->lastInsertId();

    ob_end_clean();
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "draft_id" => $draft_id,
        "message" => "Draft saved successfully"
    ]);

} catch (Exception $e) {
    ob_end_clean();
    error_log("Database insert error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to save draft: " . $e->getMessage()
    ]);
}