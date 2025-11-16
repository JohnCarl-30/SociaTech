<?php
function generateToken($userId) {
    $secret = 'sosyatek05'; 
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'iat' => time(), // kung kelan ginawa ang token
        'exp' => time() + (7 * 24 * 60 * 60)  // expires in 7 days
    ]));
    
    $signature = hash_hmac('sha256', "$header.$payload", $secret, true);
    $signature = base64_encode($signature);
    
    return "$header.$payload.$signature";
}

function verifyToken($token) {
    $secret = 'sosyatek05'; 
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    
    if ($signature !== $validSignature) {
        return false;
    }
    
    $payloadData = json_decode(base64_decode($payload), true);
    
    if ($payloadData['exp'] < time()) {
        return false;
    }
    
    return $payloadData['user_id'];
}

function getAuthToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}
?>