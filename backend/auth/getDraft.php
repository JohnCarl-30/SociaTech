<?php
// ===== CORS & Headers =====
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once '../config/database.php';

    // ===== Read JSON input safely =====
    $rawBody = file_get_contents('php://input');
    $input = null;

    if (!empty($rawBody)) {
        $input = json_decode($rawBody, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error in getDraft.php: " . json_last_error_msg());
            $input = null;
        }
    }

    // Values from body and from GET
    $bodyUserId = $input['user_id'] ?? null;
    $getUserId  = $_GET['user_id'] ?? null;

    error_log("getDraft.php body user_id: " . var_export($bodyUserId, true));
    error_log("getDraft.php GET  user_id: " . var_export($getUserId, true));

    // ===== Final user_id resolution =====
    $finalUserId = $bodyUserId ?: $getUserId;

    if (empty($finalUserId)) {
        echo json_encode([
            "success" => false,
            "error"   => "Missing user_id"
        ]);
        exit;
    }

    $user_id = (int)$finalUserId;
    error_log("Querying for user_id: " . $user_id);
    // ===== Connect to database using PDO =====
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo json_encode([
            "success" => false,
            "error" => "Database connection failed"
        ]);
        exit;
    }

    // ===== Prepare query with explicit column selection =====
    $query = $db->prepare("
        SELECT 
            id,
            user_id,
            post_category,
            post_title,
            post_content,
            post_image,
            created_at
        FROM draft 
        WHERE user_id = :user_id 
        ORDER BY created_at DESC
    ");
    
    if (!$query) {
        echo json_encode([
            "success" => false,
            "error" => "Query preparation failed"
        ]);
        exit;
    }

    // ===== Bind parameters =====
    $query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    
    // ===== Execute query =====
    $query->execute();

    // ===== Fetch all results as associative array =====
    $drafts = $query->fetchAll(PDO::FETCH_ASSOC);

    // ===== Debug: Log what we found =====
    error_log("Found " . count($drafts) . " drafts for user_id " . $user_id);
    error_log("Drafts: " . json_encode($drafts));

    // ===== Convert id to integer to ensure it's not a string =====
    foreach ($drafts as &$draft) {
        $draft['id'] = (int)$draft['id'];
        $draft['user_id'] = (int)$draft['user_id'];
    }

    // ===== Return response =====
    echo json_encode([
        "success" => true,
        "drafts" => $drafts,
        "count" => count($drafts),
        "queried_user_id" => $user_id  // Debug: confirm which user_id was queried
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => "Exception: " . $e->getMessage()
    ]);
}
?>