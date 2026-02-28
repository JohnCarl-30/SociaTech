<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://socia-tech.vercel.app"); 
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 0);
error_reporting(E_ALL);

session_start();

try {
    // Check if user is logged in
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Not authenticated"
        ]);
        exit();
    }

    require_once '../config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();

   
    $query = "SELECT user_id, fullname, username, email, profile_image, created_at 
              FROM users 
              WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $_SESSION['user_id']);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
     
        session_destroy();
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
        exit();
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Session valid",
        "data" => [
            "user" => $user
        ]
    ]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred during verification"
    ]);
}

?>