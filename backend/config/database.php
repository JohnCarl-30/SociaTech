<?php
class Database {
    public $conn;

    private function getDatabaseConfig(): array {
        $databaseUrl = getenv('DATABASE_URL');

        if ($databaseUrl) {
            $parts = parse_url($databaseUrl);

            if ($parts && isset($parts['host'], $parts['user'], $parts['pass'], $parts['path'])) {
                return [
                    'host' => $parts['host'],
                    'port' => $parts['port'] ?? 5432,
                    'user' => urldecode($parts['user']),
                    'pass' => urldecode($parts['pass']),
                    'dbname' => ltrim($parts['path'], '/'),
                ];
            }
        }

        return [
            'host' => getenv('PGHOST'),
            'port' => getenv('PGPORT') ?: 5432,
            'user' => getenv('PGUSER'),
            'pass' => getenv('PGPASSWORD'),
            'dbname' => getenv('PGDATABASE'),
        ];
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $config = $this->getDatabaseConfig();
            $host = $config['host'] ?? null;
            $port = $config['port'] ?? 5432;
            $user = $config['user'] ?? null;
            $pass = $config['pass'] ?? null;
            $dbname = $config['dbname'] ?? null;

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

        } catch (Throwable $e) {
            error_log("Database config error: " . $e->getMessage());

            header("Content-Type: application/json");
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Database configuration error"
            ]);
            exit();
        }
    }
}
?>
