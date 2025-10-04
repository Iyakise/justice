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
    $role = isset($input['role']) ? trim($input['role']) : null;

    if (!$role) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Role filter is required"]);
        exit;
    }

    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $logs = [];

    if (strtolower($role) === "all") {
        // ✅ Fetch from cms_users
        $stmt = $pdo->query("
            SELECT l.id, l.user_id, u.full_name AS user_name, u.role, l.action, l.description,
                   l.ip_address, l.user_agent, l.module, l.status, l.created_at
            FROM cms_activity_logs l
            LEFT JOIN cms_users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
        ");
        $logs = $stmt->fetchAll();

        // ✅ Replace missing names from super_admins
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
    } elseif (strtolower($role) === "admin") {
        // ✅ Only admins (super_admins)
        $stmt = $pdo->query("
            SELECT l.id, l.user_id, sa.name AS user_name, sa.role, l.action, l.description,
                   l.ip_address, l.user_agent, l.module, l.status, l.created_at
            FROM cms_activity_logs l
            LEFT JOIN super_admins sa ON l.user_id = sa.id
            WHERE sa.role IS NOT NULL
            ORDER BY l.created_at DESC
        ");
        $logs = $stmt->fetchAll();
    } else {
        // ✅ Filter cms_users by role
        $stmt = $pdo->prepare("
            SELECT l.id, l.user_id, u.full_name AS user_name, u.role, l.action, l.description,
                   l.ip_address, l.user_agent, l.module, l.status, l.created_at
            FROM cms_activity_logs l
            LEFT JOIN cms_users u ON l.user_id = u.id
            WHERE u.role = :role
            ORDER BY l.created_at DESC
        ");
        $stmt->execute([':role' => $role]);
        $logs = $stmt->fetchAll();
    }

    echo json_encode([
        "success" => true,
        "count"   => count($logs),
        "logs"    => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
