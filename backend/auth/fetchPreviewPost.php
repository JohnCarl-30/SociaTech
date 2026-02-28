<?php 
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

$contentId = $_POST['contentId'] ?? null;

try{
    $db = (new Database()) -> getConnection();
    $stmt = $db->prepare('
    SELECT * FROM post WHERE post_id = ?
    ');
    $stmt->execute([$contentId]);
     $previewPost = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    
    

    echo json_encode([
        'success' => true,
        'post' => $previewPost]);
}catch(Exception $e){
    echo json_encode(['success'=>false,'message'=> $e->getMessage()]);
}

?>