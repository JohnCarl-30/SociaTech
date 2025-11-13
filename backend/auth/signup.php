<?php

header("Content-Type: application/json");

ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    require_once '../config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    // 4. Add a check for invalid or empty JSON
    if (is_null($data)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON payload."
        ]);
        exit();
    }

    if (!empty($data->email) && !empty($data->password) && !empty($data->fullname)) {
        
        // === 1. CHECK IF EMAIL EXISTS ===
        $check_query = "SELECT id FROM users WHERE email = :email";
        $check_stmt = $db->prepare($check_query);

        if (!$check_stmt) {
            throw new Exception("SQL prepare failed (check email query).");
        }

        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Email already exists"
            ]);
            exit();
        }

        // === 2. DEFINE USERNAME ===
        $username = $data->username ?? explode('@', $data->email)[0];

        if (empty(trim($username))) {
            $username = explode('@', $data->email)[0];
        }

        // === 3. CHECK IF USERNAME EXISTS ===
        $check_user_query = "SELECT id FROM users WHERE username = :username";
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

        // === 4. HASH PASSWORD ===
        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);

        // === 5. INSERT USER ===
        $query = "INSERT INTO users (fullname, username, email, password) 
                  VALUES (:fullname, :username, :email, :password)";
        $stmt = $db->prepare($query);

        if (!$stmt) {
            throw new Exception("SQL prepare failed (insert user query).");
        }

        $stmt->bindParam(":fullname", $data->fullname);
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":email", $data->email);
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
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Incomplete data"
        ]);
    }

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
