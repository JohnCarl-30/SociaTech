<?php 

header('Access-Control-Allow-Origin: http://localhost:5173');
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

try{
    $db = (new Database()) -> getConnection();
    $stmt = $db->prepare('
    SELECT * FROM reports ORDER BY report_date DESC
    ');
    $stmt->execute();
     $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    
    foreach ($reports as &$report) {
        $report['report_reason'] = json_decode($report['report_reason'], true);
    }

    echo json_encode([
        'success' => true,
        'reports' => $reports]);
}catch(Exception $e){
    echo json_encode(['success'=>false,'message'=> $e->getMessage()]);
    
}



?>
