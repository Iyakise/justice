<?php
require_once dirname(__DIR__) . '/inc/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only GET allowed."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Fetch 30 most recent logs
    // Try to resolve user_name first from cms_users, if not found then from super_admins
    $stmt = $pdo->query("
        SELECT 
            l.id,
            l.user_id,
            COALESCE(u.full_name, s.name, 'Unknown') AS user_name,
            l.action,
            l.description,
            l.ip_address,
            l.user_agent,
            l.module,
            l.status,
            l.created_at
        FROM cms_activity_logs l
        LEFT JOIN cms_users u ON l.user_id = u.id
        LEFT JOIN super_admins s ON l.user_id = s.id
        ORDER BY l.created_at DESC
        LIMIT 30
    ");
    $logs = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "logs" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
