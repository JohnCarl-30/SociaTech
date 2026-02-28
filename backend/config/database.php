<?php
class Database {
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            // ✅ Use explicit environment variables (RECOMMENDED)
            $host = getenv('PGHOST');
            $port = getenv('PGPORT') ?: 5432;
            $user = getenv('PGUSER');
            $pass = getenv('PGPASSWORD');
            $dbname = getenv('PGDATABASE');

            // 🧪 Debug (remove after working)
            error_log("DB HOST: " . $host);
            error_log("DB USER: " . $user);

            // ❌ Stop early if missing config
            if (!$host || !$user || !$pass || !$dbname) {
                throw new Exception("Missing database environment variables");
            }

            $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";

            $this->conn = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 10,
            ]);

            return $this->conn;

        } catch(Exception $e) {
            error_log("Database config error: " . $e->getMessage());

            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Database configuration error"
            ]);
            exit();

        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());

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