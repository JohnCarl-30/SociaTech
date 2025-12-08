<?php
// Simple router or welcome page
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Sociatech API is running',
    'version' => '1.0'
]);
