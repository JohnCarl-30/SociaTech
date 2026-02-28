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

try{
    $db = (new Database()) -> getConnection();
    $stmt = $db->prepare('SELECT * FROM audit ORDER BY timestamp DESC');
    $stmt->execute();
    $audits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($audits as &$audit) {
        $audit['action_reason'] = $audit['action_reason'] ? json_decode($audit['action_reason'], true) : [];
    }

    echo json_encode([
        'success' => true,
        'audits' => $audits
    ]);
}catch(Exception $e){
    echo json_encode(['success'=>false,'message'=> $e->getMessage()]);
}
