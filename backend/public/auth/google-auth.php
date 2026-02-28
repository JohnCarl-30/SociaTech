<?php
// 1. Allow the specific origin of your frontend
header("Access-Control-Allow-Origin: https://socia-tech.vercel.app");

// 2. Allow credentials (required because you use 'credentials: include' in JS)
header("Access-Control-Allow-Credentials: true");

// 3. Allow specific methods
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");

// 4. Allow the headers your frontend is sending
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// 5. Handle the OPTIONS "Preflight" request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- YOUR EXISTING CODE STARTS HERE ---
header("Content-Type: application/json");

ini_set('display_errors', 0);
// ... rest of your code

// Temporarily enable for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if database.php exists
$db_file = '../config/database.php';
if (!file_exists($db_file)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database configuration file not found",
        "error" => "File does not exist: " . $db_file
    ]);
    exit();
}

require_once $db_file;

try {
    // Test database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // Enable exception mode for better error reporting
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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

    // Validate required fields
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

    
    $check_query = "SELECT user_id, fullname, username, email, profile_image, google_id, created_at 
                    FROM users 
                    WHERE google_id = :google_id OR email = :email";
    
    $check_stmt = $db->prepare($check_query);

    if (!$check_stmt) {
        $errorInfo = $db->errorInfo();
        throw new Exception("SQL prepare failed: " . $errorInfo[2]);
    }

    $check_stmt->bindParam(":google_id", $google_id);
    $check_stmt->bindParam(":email", $email);
    
    if (!$check_stmt->execute()) {
        $errorInfo = $check_stmt->errorInfo();
        throw new Exception("Query execution failed: " . $errorInfo[2]);
    }

    if ($check_stmt->rowCount() > 0) {
       
        $user = $check_stmt->fetch(PDO::FETCH_ASSOC);

        // Update google_id if it's null
        if (empty($user['google_id'])) {
            $update_query = "UPDATE users SET google_id = :google_id, profile_image = :profile_image WHERE user_id = :user_id";
            $update_stmt = $db->prepare($update_query);
            
            if (!$update_stmt) {
                $errorInfo = $db->errorInfo();
                throw new Exception("Update prepare failed: " . $errorInfo[2]);
            }
            
            $update_stmt->bindParam(":google_id", $google_id);
            $update_stmt->bindParam(":profile_image", $profile_image);
            $update_stmt->bindParam(":user_id", $user['user_id']);
            
            if (!$update_stmt->execute()) {
                $errorInfo = $update_stmt->errorInfo();
                throw new Exception("Update execution failed: " . $errorInfo[2]);
            }
            
            $user['google_id'] = $google_id;
            $user['profile_image'] = $profile_image;
        }

        // Set session
        $_SESSION['user_id'] = $user['user_id'];
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

  
    $check_username_query = "SELECT user_id FROM users WHERE username = :username";
    $check_username_stmt = $db->prepare($check_username_query);
    
    if (!$check_username_stmt) {
        $errorInfo = $db->errorInfo();
        throw new Exception("Username check prepare failed: " . $errorInfo[2]);
    }
    
    $check_username_stmt->bindParam(":username", $username);
    $check_username_stmt->execute();

    if ($check_username_stmt->rowCount() > 0) {
        $username = $username . rand(100, 999);
    }

  
    $insert_query = "INSERT INTO users (fullname, username, email, google_id, profile_image, password)
                     VALUES (:fullname, :username, :email, :google_id, :profile_image, :password)
                     RETURNING user_id";

    try {
        $insert_stmt = $db->prepare($insert_query);

        if (!$insert_stmt) {
            $errorInfo = $db->errorInfo();
            throw new Exception("Insert prepare failed: " . $errorInfo[2]);
        }

        $dummy_password = password_hash(bin2hex(random_bytes(32)), PASSWORD_BCRYPT);

        $insert_stmt->bindParam(":fullname", $fullname);
        $insert_stmt->bindParam(":username", $username);
        $insert_stmt->bindParam(":email", $email);
        $insert_stmt->bindParam(":google_id", $google_id);
        $insert_stmt->bindParam(":profile_image", $profile_image);
        $insert_stmt->bindParam(":password", $dummy_password);

        if (!$insert_stmt->execute()) {
            $errorInfo = $insert_stmt->errorInfo();
            throw new Exception("Insert execution failed: " . $errorInfo[2]);
        }
        $inserted = $insert_stmt->fetch(PDO::FETCH_ASSOC);
        $user_id = $inserted['user_id'];
    } catch (PDOException $e) {
        error_log("Insert error details: " . print_r($e->errorInfo, true));
        throw new Exception("Database insert failed: " . $e->getMessage());
    }
    $user = [
        'user_id' => $user_id,
        'fullname' => $fullname,
        'username' => $username,
        'email' => $email,
        'google_id' => $google_id,
        'profile_image' => $profile_image,
        'created_at' => date('Y-m-d H:i:s')
    ];

    // Set session
    $_SESSION['user_id'] = $user['user_id'];
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

} catch (PDOException $e) {
    error_log("PDO Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error occurred",
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
} catch (Throwable $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An internal server error occurred",
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}

?>
