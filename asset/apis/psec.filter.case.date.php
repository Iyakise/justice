<?php
require_once dirname(__DIR__) . '/inc/db.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Invalid request method. Use POST.']);
        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);

    $date = isset($input['date']) ? trim($input['date']) : null;

    if (!$date) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Date is required']);
        exit;
    }

    // ✅ DB connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Fetch logs for the given date
    $sql = "
        SELECT 
            l.id,
            l.user_id,
            u.full_name AS user_name,
            l.action,
            l.description,
            l.ip_address,
            l.user_agent,
            l.module,
            l.status,
            l.created_at
        FROM cms_activity_logs l
        LEFT JOIN cms_users u ON l.user_id = u.id
        WHERE DATE(l.created_at) = :date
        ORDER BY l.created_at DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':date' => $date]);
    $logs = $stmt->fetchAll();

    // ✅ If user not found in cms_users, check super_admins
    foreach ($logs as &$log) {
        if (empty($log['user_name'])) {
            $adminStmt = $pdo->prepare("SELECT name FROM super_admins WHERE id = :id");
            $adminStmt->execute([':id' => $log['user_id']]);
            $admin = $adminStmt->fetch();

            if ($admin) {
                $log['user_name'] = $admin['name'] . " (Super Admin)";
            } else {
                $log['user_name'] = "Unknown User";
            }
        }
    }

    echo json_encode([
        'success' => true,
        'count'   => count($logs),
        'logs'    => $logs
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
    exit;
}
