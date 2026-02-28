<?php 

header('Access-Control-Allow-Origin: https://socia-tech.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

$reportType = $_POST['type'] ?? null;
$reportedBy = $_POST['reportedBy'] ?? null;
$reportedUID = $_POST['reportedUID'] ?? null;
$reportReason = json_encode($_POST['reportReason']);
$contentId = $_POST['contentId'] ?? null;
try{
    $database = new Database();
    $db = $database -> getConnection();

    $stmt = $db->prepare('INSERT INTO reports (report_date,reported_by,reported_uid,report_reason,type, content_id) VALUES (NOW(),?,?,?,?,?)');
    $stmt->execute([$reportedBy,$reportedUID,$reportReason,$reportType,$contentId]);

     echo json_encode(['success' => true, 'message' => 'Report ticket has been successfully sent! Admin will review your report concerns and conduct a proper actions for violators! Thankyou for reporting!']);



}catch(Exception $e){
    echo json_encode(['success'=> false, 'error' => $e -> getMessage()]);
}



?>