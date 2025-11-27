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
    $database = new Database();
    $db = $database->getConnection();
    // Total users
    $stmt = $db->prepare("SELECT COUNT(user_id) AS total_users FROM users");
    $stmt->execute();
    $total_users = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'];

    // Total posts
    $stmt = $db->prepare("SELECT COUNT(post_id) AS total_posts FROM post");
    $stmt->execute();
    $total_posts = $stmt->fetch(PDO::FETCH_ASSOC)['total_posts'];

    // Total comments
    $stmt = $db->prepare("SELECT COUNT(comment_id) AS total_comments FROM comments");
    $stmt->execute();
    $total_comments = $stmt->fetch(PDO::FETCH_ASSOC)['total_comments'];

    // Total pending reports
    $stmt = $db->prepare("SELECT COUNT(report_id) AS total_reports FROM reports WHERE status = 'pending'");
    $stmt->execute();
    $total_reports = $stmt->fetch(PDO::FETCH_ASSOC)['total_reports'];

    echo json_encode([
        'success' => true,
        'total_users' => $total_users,
        'total_posts' => $total_posts,
        'total_comments' => $total_comments,
        'total_reports' => $total_reports
    ]);

}catch(Exception $e){
     echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}













?>