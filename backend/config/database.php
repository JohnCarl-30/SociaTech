<?php
class Database {
    public $conn;
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            // Parse the MYSQL_PUBLIC_URL
            $url = getenv('MYSQL_PUBLIC_URL');
            
            if ($url) {
                // Parse the URL
                $parts = parse_url($url);
                $host = $parts['host'];
                $port = $parts['port'];
                $user = $parts['user'];
                $pass = $parts['pass'];
                $dbname = ltrim($parts['path'], '/');
            } else {
                // Fallback to individual environment variables
                $host = getenv('MYSQLHOST');
                $port = getenv('MYSQLPORT');
                $user = getenv('MYSQLUSER');
                $pass = getenv('MYSQLPASSWORD');
                $dbname = getenv('MYSQLDATABASE');
            }
            
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            
            $this->conn = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 10, // Increased timeout
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
            
            return $this->conn;
            
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            error_log("DSN attempted: mysql:host={$host};port={$port};dbname={$dbname}");
            
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Database connection failed"
            ]);
            exit();
        }
    }
}
?>
