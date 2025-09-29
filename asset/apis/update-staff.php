<?php
require_once dirname(__DIR__) . '/inc/db.php';
require_once dirname(__DIR__) . '/inc/function.php';
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php';
require_once dirname(__DIR__) . '/apis/auth/session-bootstrap.php';

header("Content-Type: application/json");

// session_start(); // assuming you store admin id in session

try {
    // Connect with PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Ensure only admins can update
    // if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    //     http_response_code(403);
    //     echo json_encode(["error" => "Unauthorized"]);
    //     exit;
    // }

    // Get raw input
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $userId   = (int) $input['id'];
    $fullName = $input['full_name'] ?? null;
    $email    = $input['email'] ?? null;
    $phone    = $input['phone'] ?? null;
    // $username = $input['username'] ?? null;
    $role     = $input['role'] ?? null;
    $status   = $input['status'] ?? null;
    $department = $input['department'] ?? null;

    // Build dynamic update query
    $fields = [];
    $params = [":id" => $userId];

    if ($fullName !== null) { $fields[] = "full_name = :full_name"; $params[":full_name"] = $fullName; }
    if ($email    !== null) { $fields[] = "email = :email"; $params[":email"] = $email; }
    if ($phone    !== null) { $fields[] = "phone = :phone"; $params[":phone"] = $phone; }
    // if ($username !== null) { $fields[] = "username = :username"; $params[":username"] = $username; }
    if ($role     !== null) { $fields[] = "role = :role"; $params[":role"] = $role; }
    if ($status   !== null) { $fields[] = "status = :status"; $params[":status"] = $status; }
    if ($department !== null) { $fields[] = "department = :department"; $params[":department"] = $department; }

    if (empty($fields)) {
        echo json_encode(["error" => "No fields to update"]);
        http_response_code(403);
        exit;
    }

    $actor_id   = $_SESSION['sauth']['id'] ?? null;
    $actor_role = $_SESSION['sauth']['role'] ?? 'system';

    $sql = "UPDATE cms_users SET " . implode(", ", $fields) . ", updated_at = NOW() WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Log activity
    $logStmt = $pdo->prepare("
        INSERT INTO cms_activity_logs 
            (user_id, action, description, ip_address, user_agent, module, status, created_at) 
        VALUES 
            (:user_id, :action, :description, :ip, :ua, :module, :status, NOW())
    ");

    $logStmt->execute([
        ":user_id"    => $actor_id, // admin performing update
        ":action"     => "USER_UPDATE",
        ":description"=> "Updated user with ID {$userId}",
        ":ip"         => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ":ua"         => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        ":module"     => "Users",
        ":status"     => "SUCCESS"
    ]);

    /*
    log_activity($pdo, $actor_id, "case_update",
            "Changed lawyer for case {$oldCase['case_number']} from ID {$oldCase['assigned_to']} to ID {$assigned_to}",
            "SUCCESS", "cases");
            */

    echo json_encode([
        "success" => true,
        "message" => "User updated successfully"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
