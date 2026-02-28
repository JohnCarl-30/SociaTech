<?php
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    $search = $_GET['query'] ?? null;
    if (!$search) {
        echo json_encode([
            'success' => false,
            'message' => 'Search query is required'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    // Search using LIKE for flexible word-by-word matching
    $searchTerm = "%{$search}%";
    
    $stmt = $db->prepare("
        SELECT 
            p.post_id,
            p.post_title,
            p.post_content,
            p.post_image,
            u.user_id,
            u.username,
            u.profile_image
        FROM post p
        JOIN users u ON u.user_id = p.user_id
        WHERE 
            p.post_title LIKE :search
            OR p.post_content LIKE :search
            OR u.username LIKE :search
        ORDER BY p.post_id DESC
        LIMIT 20
    ");

    $stmt->bindParam(':search', $searchTerm);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'results' => $results
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>