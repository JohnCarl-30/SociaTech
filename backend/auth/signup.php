<?php

header("Content-Type: application/json");

ini_set('display_errors', 0);
error_reporting(0);

try {
    require_once '../config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input")); // to read json input

    
    if (is_null($data)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON." 
        ]);
        exit();
    }

    
    if (empty($data->email) || empty($data->password) || empty($data->fullname)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Incomplete data. Email, password, and full name are required."
        ]);
        exit(); // if the data send is incomplete it will exit here
    }

    
    $email = trim($data->email);
    $fullname = trim($data->fullname);
    $password = $data->password;
    
   
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email format."
        ]);
        exit(); // exit if email format is invalid
    }

  
    if (strlen($fullname) < 1) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Full name is required." 
        ]);
        exit(); // exit if full name is invalid
    }

    // === VALIDATE PASSWORD RULES ===
    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Password must be at least 8 characters long."
        ]);
        exit(); // exit if password is too short
    }

    if (!preg_match('/[A-Z]/', $password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Password must contain at least one uppercase letter."
        ]);
        exit(); 
    }

    if (!preg_match('/[0-9]/', $password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Password must contain at least one number."
        ]);
        exit(); 
    }

    if (!preg_match('/[!@#$%^&*(),.?":{}|<>_-]/', $password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Password must contain at least one special character."
        ]);
        exit(); 
    }

    $username = isset($data->username) && !empty(trim($data->username)) 
        ? trim($data->username) 
        : explode('@', $email)[0]; 
    // Validate username format if provided
    if (isset($data->username) && !empty(trim($data->username))) {
        if (strlen($username) < 3) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Username must be at least 3 characters long."
            ]);
            exit(); // exit if username is too short
        }

        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Username can only contain letters, numbers, and underscores."
            ]);
            exit(); // exit if username format is invalid
        }
    }
    
   
    $check_query = "SELECT user_id FROM users WHERE email = :email";
    $check_stmt = $db->prepare($check_query);

    if (!$check_stmt) {
        throw new Exception("SQL prepare failed (check email query).");
    }

    $check_stmt->bindParam(":email", var: $email);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email already exists"
        ]);
        exit(); // exit if email already exists
    }

   
    $check_user_query = "SELECT user_id FROM users WHERE username = :username";
    $check_user_stmt = $db->prepare($check_user_query);

    if (!$check_user_stmt) {
        throw new Exception("SQL prepare failed (check username query).");
    }

    $check_user_stmt->bindParam(":username", $username);
    $check_user_stmt->execute();

    if ($check_user_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Username already exists"
        ]);
        exit();
    }

    
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

   
    $query = "INSERT INTO users (fullname, username, email, password) 
              VALUES (:fullname, :username, :email, :password)";
    $stmt = $db->prepare($query);

    if (!$stmt) {
        throw new Exception("SQL prepare failed (insert user query).");
    }

    $stmt->bindParam(":fullname", $fullname);
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $hashed_password);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "User registered successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to execute registration"
        ]);
    }

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An internal server error occurred."
    ]);
}

?>