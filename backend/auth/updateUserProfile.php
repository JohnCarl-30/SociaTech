<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $user_id = $input['user_id'] ?? null;
    $fullname = $input['fullname'] ?? null;
    $username = $input['username'] ?? null;
    $bio = $input['bio'] ?? null;

    if (!$user_id) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }

    $db = (new Database())->getConnection();

    // Check if username already exists 
    if ($username) {
        $stmt = $db->prepare("
            SELECT user_id FROM users 
            WHERE username = :username AND user_id != :user_id
        ");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Username already taken'
            ]);
            exit;
        }
    }

    $updateFields = [];
    $params = [':user_id' => $user_id];

    if ($fullname !== null) {
        $updateFields[] = "fullname = :fullname";
        $params[':fullname'] = $fullname;
    }
    if ($username !== null) {
        $updateFields[] = "username = :username";
        $params[':username'] = $username;
    }
    if ($bio !== null) {
        $updateFields[] = "bio = :bio";
        $params[':bio'] = $bio;
    }

    if (empty($updateFields)) {
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        exit;
    }

    $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE user_id = :user_id";
    $stmt = $db->prepare($sql);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->execute();
    $stmt = $db->prepare("
        SELECT fullname, username, bio, profile_image 
        FROM users 
        WHERE user_id = :user_id
    ");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $updatedUser
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>