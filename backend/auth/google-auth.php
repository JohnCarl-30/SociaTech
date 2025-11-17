<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173"); //frontend URL
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 0);
error_reporting(E_ALL);

session_start();

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    // Validate JSON
    if (is_null($data)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON."
        ]);
        exit();
    }


    if (empty($data->google_id) || empty($data->email) || empty($data->fullname)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Google ID, email, and fullname are required"
        ]);
        exit();
    }

    $google_id = trim($data->google_id);
    $email = trim($data->email);
    $fullname = trim($data->fullname);
    $username = isset($data->username) && !empty(trim($data->username)) 
        ? trim($data->username) 
        : explode('@', $email)[0];
    $profile_image = isset($data->profile_image) ? trim($data->profile_image) : 'default_pfp.png';

    
    $check_query = "SELECT id, fullname, username, email, profile_image, google_id, created_at 
                    FROM users 
                    WHERE google_id = :google_id OR email = :email";
    $check_stmt = $db->prepare($check_query);

    if (!$check_stmt) {
        throw new Exception("SQL prepare failed (check user query).");
    }

    $check_stmt->bindParam(":google_id", $google_id);
    $check_stmt->bindParam(":email", $email);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
      
        $user = $check_stmt->fetch(PDO::FETCH_ASSOC);

    
        if (empty($user['google_id'])) {
            $update_query = "UPDATE users SET google_id = :google_id, profile_image = :profile_image WHERE id = :id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(":google_id", $google_id);
            $update_stmt->bindParam(":profile_image", $profile_image);
            $update_stmt->bindParam(":id", $user['id']);
            $update_stmt->execute();
            
            $user['google_id'] = $google_id;
            $user['profile_image'] = $profile_image;
        }

        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['logged_in'] = true;

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "data" => [
                "user" => $user
            ]
        ]);
        exit();
    }

    // Check if username is taken
    $check_username_query = "SELECT id FROM users WHERE username = :username";
    $check_username_stmt = $db->prepare($check_username_query);
    $check_username_stmt->bindParam(":username", $username);
    $check_username_stmt->execute();

    if ($check_username_stmt->rowCount() > 0) {
        
        $username = $username . rand(100, 999);
    }

    // User doesn't exist - create new account
    $insert_query = "INSERT INTO users (fullname, username, email, google_id, profile_image, password) 
                     VALUES (:fullname, :username, :email, :google_id, :profile_image, :password)";
    $insert_stmt = $db->prepare($insert_query);

    if (!$insert_stmt) {
        throw new Exception("SQL prepare failed (insert user query).");
    }

    $dummy_password = password_hash(bin2hex(random_bytes(32)), PASSWORD_BCRYPT);

    $insert_stmt->bindParam(":fullname", $fullname);
    $insert_stmt->bindParam(":username", $username);
    $insert_stmt->bindParam(":email", $email);
    $insert_stmt->bindParam(":google_id", $google_id);
    $insert_stmt->bindParam(":profile_image", $profile_image);
    $insert_stmt->bindParam(":password", $dummy_password);

    if (!$insert_stmt->execute()) {
        throw new Exception("Failed to create user account");
    }

    // Get the newly created user
    $user_id = $db->lastInsertId();
    $user = [
        'id' => $user_id,
        'fullname' => $fullname,
        'username' => $username,
        'email' => $email,
        'google_id' => $google_id,
        'profile_image' => $profile_image,
        'created_at' => date('Y-m-d H:i:s')
    ];

    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['logged_in'] = true;

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "User registered successfully",
        "data" => [
            "user" => $user
        ]
    ]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An internal server error occurred.",
        "error" => $e->getMessage()
    ]);
}

?>