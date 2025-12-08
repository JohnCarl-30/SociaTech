<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection(); 

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

try {
    // Check if user already has a score for this quiz
    $stmt = $conn->prepare("SELECT id FROM quiz WHERE user_id = :user_id AND quiz_id = :quiz_id");
    $stmt->execute([
        ':user_id' => $data['user_id'],
        ':quiz_id' => $data['quiz_id']
    ]);

    if ($stmt->rowCount() > 0) {
        // Update existing score
        $update = $conn->prepare("UPDATE quiz SET score = :score, date_taken = :date_taken WHERE user_id = :user_id AND quiz_id = :quiz_id");
        $update->execute([
            ':score' => $data['score'],
            ':date_taken' => $data['date_taken'],
            ':user_id' => $data['user_id'],
            ':quiz_id' => $data['quiz_id']
        ]);

        $response = ['success' => true, 'message' => 'Score updated successfully!'];
    } else {
        // Insert new score
        $insert = $conn->prepare("INSERT INTO quiz (user_id, quiz_id, quiz_title, category, score, date_taken) VALUES (:user_id, :quiz_id, :quiz_title, :category, :score, :date_taken)");
        $insert->execute([
            ':user_id' => $data['user_id'],
            ':quiz_id' => $data['quiz_id'],
            ':quiz_title' => $data['quiz_title'],
            ':category' => $data['category'],
            ':score' => $data['score'],
            ':date_taken' => $data['date_taken']
        ]);

        $response = ['success' => true, 'message' => 'Score saved successfully!'];
    }

    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>