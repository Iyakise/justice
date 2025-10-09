<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

if($_SERVER['REQUEST_METHOD'] !== 'GET'){
    http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Request not accepted"
        ]);
        exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);


    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.case_number,
            c.title,
            c.filed_by AS client_id,
            u.full_name AS client_name,
            l.full_name AS lawyer,
            c.created_at AS date_assigned,
            c.court_date AS deadline,
            c.status,
            c.priority
        FROM cms_cases c
        LEFT JOIN cms_users u ON c.filed_by = u.id
        LEFT JOIN cms_users l ON c.assigned_to = l.id
        ORDER BY c.created_at DESC
    ");
    $stmt->execute();
    $cases = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $cases
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
