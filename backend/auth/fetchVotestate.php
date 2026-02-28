<?php 
header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

$user_id = $_POST['user_id']?? null;
if(!$user_id){
    echo json_encode(['success' => false, 'message' => 'User ID is required']);
    exit;
}






?>