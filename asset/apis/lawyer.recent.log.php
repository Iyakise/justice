<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $lawyerId = isset($_GET['uid']) ? (int) $_GET['uid'] : 0;

    if ($lawyerId <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing or invalid parameter: uid"
        ]);
        exit;
    }

    // Fetch last 50 activity logs for this lawyer (you can change the LIMIT)
    $stmt = $pdo->prepare("
        SELECT 
            l.id,
            l.action,
            l.description,
            l.module,
            l.status,
            l.ip_address,
            l.user_agent,
            l.created_at
        FROM cms_activity_logs l
        WHERE l.user_id = :lawyerId
        ORDER BY l.created_at DESC
        LIMIT 5
    ");
    $stmt->execute([":lawyerId" => $lawyerId]);
    $logs = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
