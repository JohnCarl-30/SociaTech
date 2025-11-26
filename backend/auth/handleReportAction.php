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

$userAction = $_POST['userAction'] ?? 'no_action';
$contentAction = $_POST['contentAction'] ?? 'no_action';
$reportId = $_POST['reportId'];
$reportedUID = $_POST['reportedUID'];
$contentId = $_POST['contentId'];

$days = 7;

$suspend_until = date('Y-m-d H:i:s', strtotime("+$days days"));

try{
    $database = new Database();
    $db = $database->getConnection();
    $response = ['success' => true, 'message' => ''];

    if ($userAction === "ban") {
        if ($contentAction === "delete_post") {
            $stmt =$db->prepare("UPDATE users SET status = 'ban' WHERE user_id = ? ");
            $stmt->execute([$reportedUID]);

            $stmt =$db->prepare("DELETE FROM post WHERE user_id = ? AND post_id = ?  ");
            $stmt->execute([$reportedUID, $contentId]);

            $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);

            $response['message'] = 'User has been banned and the post has been deleted.';
        } elseif ($contentAction === "delete_comment") {
            $stmt =$db->prepare("UPDATE users SET status = 'ban' WHERE user_id = ? ");
            $stmt->execute([$reportedUID]);

            $stmt =$db->prepare("DELETE FROM comments WHERE user_id = ? AND comment_id = ?  ");
            $stmt->execute([$reportedUID, $contentId]);

            $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);

            $response['message'] = 'User has been banned and the comment has been deleted.';


            // banUser();
            // deleteComment();
        } else {

            $stmt =$db->prepare("UPDATE users SET status = 'ban' WHERE user_id = ? ");
            $stmt->execute([$reportedUID]);


            $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);

            $response['message'] = 'User has been banned.';
            // banUser();
        }
} elseif ($userAction === "suspend") {
    if ($contentAction === "delete_post") {
        $stmt =$db->prepare("UPDATE users SET status = 'suspended', suspended_until = ? WHERE user_id = ? ");
            $stmt->execute([$suspend_until,$reportedUID]);

            $stmt =$db->prepare("DELETE FROM post WHERE user_id = ? AND post_id = ?  ");
            $stmt->execute([$reportedUID, $contentId]);

            $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);

            $response['message'] = 'User has been suspended for 7 days and the post has been deleted.';
        // suspendUser();
        // deletePost();
    } elseif ($contentAction === "delete_comment") {
            $stmt =$db->prepare("UPDATE users SET status = 'suspended', suspended_until = ? WHERE user_id = ? ");
                $stmt->execute([$suspend_until,$reportedUID]);

            
            $stmt =$db->prepare("DELETE FROM comments WHERE user_id = ? AND comment_id = ? ");
            $stmt->execute([$reportedUID, $contentId]);

            
            $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);

            $response['message'] = 'User has been suspended for 7 days and the comment has been deleted.';


        // suspendUser();
        // deleteComment();
    } else {
         $stmt =$db->prepare("UPDATE users SET status = 'suspended', suspended_until = ? WHERE user_id = ? ");
                $stmt->execute([$suspend_until,$reportedUID]);
        
                 $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);

            $response['message'] = 'User has been suspended for 7 days.';

    }
} elseif ($userAction === "no_action") {
    if ($contentAction === "delete_post") {
         $stmt =$db->prepare("DELETE FROM post WHERE user_id = ? AND post_id = ?  ");
            $stmt->execute([$reportedUID, $contentId]);

            $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);

            $response['message'] = 'Post has been deleted. No action taken on user.';
    } elseif ($contentAction === "delete_comment") {
       $stmt =$db->prepare("DELETE FROM comments WHERE user_id = ? AND comment_id = ? ");
            $stmt->execute([$reportedUID, $contentId]);


            $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);
            $response['message'] = 'Comment has been deleted. No action taken on user.';
    }else{
         $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);
            $response['message'] = 'Report has been resolved, No action taken on user and  its post.';
    }
}else{
    $stmt =$db->prepare("UPDATE reports SET status = 'resolved' WHERE report_id = ? ");
            $stmt->execute([$reportId]);
            $response['message'] = 'Report has been resolved, No action taken on user and  its post.';
}


echo json_encode($response);
}catch(Exception $e){
     echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

?>