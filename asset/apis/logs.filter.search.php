<?php
require_once dirname(__DIR__) . '/inc/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only POST allowed."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $data = json_decode(file_get_contents("php://input"), true);
    $search = isset($data['search']) ? trim($data['search']) : '';
    $limit = isset($data['limit']) ? (int)$data['limit'] : 50;

    if (empty($search)) {
        http_response_code(400);
        echo json_encode(["error" => "Search term is required"]);
        exit;
    }

    // ✅ Search logs by action OR description
    $stmt = $pdo->prepare("
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
        WHERE l.action LIKE :search
           OR l.description LIKE :search
        ORDER BY l.created_at DESC
        LIMIT 50
    ");
    $stmt->execute([":search" => "%" . $search . "%"]);
    $logs = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "search" => $search,
        "count" => count($logs),
        "logs" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
