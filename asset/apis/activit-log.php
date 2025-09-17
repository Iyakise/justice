<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status'  => false,
        'message' => 'Method Not Allowed'
    ]);
    exit;
}

try {
    // Create PDO connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Fetch logs, newest first
    $stmt = $pdo->query("
        SELECT id, user_id, action, description, ip_address, module, user_agent, created_at
        FROM cms_activity_logs
        ORDER BY created_at DESC
    ");
    $logs = $stmt->fetchAll();

    // Prepare name lookups
    $stmtUser = $pdo->prepare("SELECT full_name FROM cms_users WHERE id = :id LIMIT 1");
    $stmtAdmin = $pdo->prepare("SELECT name FROM super_admins WHERE id = :id LIMIT 1");

    foreach ($logs as &$log) {
        $userId = $log['user_id'];
        $name   = null;

        if (!empty($userId)) {
            // First check cms_users
            $stmtUser->execute([':id' => $userId]);
            $row = $stmtUser->fetch();
            if ($row) {
                $name = $row['name'];
            } else {
                // Fallback check in super_admins
                $stmtAdmin->execute([':id' => $userId]);
                $row = $stmtAdmin->fetch();
                if ($row) {
                    $name = $row['name'];
                }
            }
        }

        $log['name'] = $name; // null if not found
    }

    echo json_encode([
        'status' => true,
        'count'  => count($logs),
        'data'   => $logs
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    exit;
}
