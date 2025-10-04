<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $lawyerId = isset($_GET['uid']) ? (int) $_GET['uid'] : 0;
    $query    = isset($_GET['q']) ? trim($_GET['q']) : '';

    if ($lawyerId <= 0 || empty($query)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required parameters: uid and q"
        ]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.case_number,
            c.title,
            c.status,
            c.priority,
            c.court_date,
            c.created_at AS date_assigned,
            c.court_date AS deadline,
            u.full_name AS client_name
        FROM cms_cases c
        LEFT JOIN cms_users u ON c.filed_by = u.id
        WHERE c.assigned_to = :lawyerId
          AND (
                c.case_number LIKE :search
             OR c.title LIKE :search
          )
        ORDER BY c.created_at DESC
    ");


    $stmt->execute([
        ":lawyerId" => $lawyerId,
        ":search"   => "%" . $query . "%"
    ]);
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
