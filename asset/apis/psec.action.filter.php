<?php
require_once dirname(__DIR__) . '/inc/db.php';

header("Content-Type: application/json");

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Invalid request method. Use POST."]);
        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);
    $actionType = isset($input['action_type']) ? trim($input['action_type']) : null;

    if (!$actionType) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Action type is required"]);
        exit;
    }

    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $logs = [];

    if (strtolower($actionType) === "all") {
        // ✅ Return everything
        $stmt = $pdo->query("
            SELECT l.id, l.user_id, u.full_name AS user_name, u.role,
                   l.action, l.description, l.ip_address, l.user_agent, 
                   l.module, l.status, l.created_at
            FROM cms_activity_logs l
            LEFT JOIN cms_users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
        ");
        $logs = $stmt->fetchAll();

        // ✅ Replace missing names with super_admins
        foreach ($logs as &$log) {
            if (empty($log['user_name'])) {
                $adminStmt = $pdo->prepare("SELECT name, role FROM super_admins WHERE id = :id");
                $adminStmt->execute([':id' => $log['user_id']]);
                $admin = $adminStmt->fetch();
                if ($admin) {
                    $log['user_name'] = $admin['name'];
                    $log['role'] = $admin['role'] ?? "Admin";
                }
            }
        }
    } else {
        // ✅ Specific action filter (e.g., "new_case_add", "login", "profile_update", "case_reassignment")
        $stmt = $pdo->prepare("
            SELECT l.id, l.user_id, u.full_name AS user_name, u.role,
                   l.action, l.description, l.ip_address, l.user_agent, 
                   l.module, l.status, l.created_at
            FROM cms_activity_logs l
            LEFT JOIN cms_users u ON l.user_id = u.id
            WHERE l.action = :action
            ORDER BY l.created_at DESC
        ");
        $stmt->execute([':action' => $actionType]);
        $logs = $stmt->fetchAll();

        // ✅ Replace missing names with super_admins
        foreach ($logs as &$log) {
            if (empty($log['user_name'])) {
                $adminStmt = $pdo->prepare("SELECT name, role FROM super_admins WHERE id = :id");
                $adminStmt->execute([':id' => $log['user_id']]);
                $admin = $adminStmt->fetch();
                if ($admin) {
                    $log['user_name'] = $admin['name'];
                    $log['role'] = $admin['role'] ?? "Admin";
                }
            }
        }
    }

    echo json_encode([
        "success" => true,
        "count"   => count($logs),
        "logs"    => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
