<?php 
header('Access-Control-Allow-Origin: http://localhost:5173');
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


$database = new Database();
$db = $database->getConnection();

try{
$stmt = $db->prepare("SELECT quiz_id, score FROM quiz WHERE user_id = ? ORDER BY date_taken DESC");
 $stmt ->execute([$user_id]);
$scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
if(empty($scores)){
     echo json_encode(['success' => true, 'scores' => []]);
     exit;
}

echo json_encode(['success' => true, 'scores' => $scores]);

}catch(Exception $e){
     echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}












?>