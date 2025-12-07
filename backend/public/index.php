<?php
header("Content-Type: application/json");
echo json_encode([
    "status" => "running",
    "message" => "API deployed successfully!"
]);
