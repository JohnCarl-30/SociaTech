<?php
class Database {
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $url = getenv('DATABASE_URL');

            if ($url) {
                $parts = parse_url($url);
                $host = $parts['host'];
                $port = $parts['port'] ?? 5432;
                $user = $parts['user'];
                $pass = $parts['pass'];
                $dbname = ltrim($parts['path'], '/');
            } else {
                $host = getenv('PGHOST');
                $port = getenv('PGPORT') ?: 5432;
                $user = getenv('PGUSER');
                $pass = getenv('PGPASSWORD');
                $dbname = getenv('PGDATABASE');
            }

            $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";

            $this->conn = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 10,
            ]);

            return $this->conn;

        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());

            header("Access-Control-Allow-Origin: https://socia-tech.vercel.app");
            header("Access-Control-Allow-Credentials: true");
            header("Content-Type: application/json");

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
