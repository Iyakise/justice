<?php
require_once dirname(__DIR__, 2) . '/inc/db.php';
// require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

session_start();

class Auth {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function login($username, $password) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM cms_users WHERE email = :username LIMIT 1");
            $stmt->execute([":username" => $username]);
            $user = $stmt->fetch();

            if (!$user) {
                $this->logActivity(null, "LOGIN_FAIL", "Invalid username: $username", "Users", "FAILED");
                return ["success" => false, "message" => "Invalid username or password"];
            }

            // Verify password (assuming stored as hashed)
            if (!password_verify($password, $user['password'])) {
                $this->logActivity($user['id'], "LOGIN_FAIL", "Wrong password for user: $username", "Users", "FAILED");
                return ["success" => false, "message" => "Invalid username or password"];
            }

            // Save session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $user['email'];
            $_SESSION['name'] = $user['full_name'];
            $_SESSION['isAuthenticated'] = true;

            $this->logActivity($user['id'], "LOGIN_SUCCESS", "User logged in: $username", "Users", "SUCCESS");

            return ["success" => true, "message" => "Login successful", "user" => [
                "id" => $user['id'],
                "full_name" => $user['full_name'],
                "role" => $user['role'],
                "department" => $user['department']
            ]];

        } catch (Exception $e) {
            return ["success" => false, "message" => "Server error: " . $e->getMessage()];
        }
    }

    private function logActivity($userId, $action, $description, $module, $status) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO cms_activity_logs 
                    (user_id, action, description, ip_address, user_agent, module, status, created_at)
                VALUES 
                    (:user_id, :action, :description, :ip, :ua, :module, :status, NOW())
            ");

            $stmt->execute([
                ":user_id" => $userId,
                ":action" => $action,
                ":description" => $description,
                ":ip" => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                ":ua" => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                ":module" => $module,
                ":status" => $status
            ]);
        } catch (Exception $e) {
            // Fail silently to not break login
        }
    }
}

// ---------- MAIN EXECUTION ----------

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $auth = new Auth($pdo);

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input || !isset($input['email'], $input['password'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Username and password are required"]);
        exit;
    }

    $result = $auth->login($input['email'], $input['password']);
    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Connection error: " . $e->getMessage()]);
}
