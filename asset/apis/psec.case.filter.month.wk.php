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
    $filter = isset($input['filter']) ? strtolower(trim($input['filter'])) : '';

    if ($filter === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Filter value is required']);
        exit;
    }

    // DB connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // base query
    $sql = "
        SELECT 
            c.id,
            c.case_number,
            c.title,
            c.description,
            c.case_type,
            c.status,
            c.priority,
            c.created_at,
            client.full_name AS client_name,
            lawyer.full_name AS lawyer_name
        FROM cms_cases c
        LEFT JOIN cms_users client ON c.filed_by = client.id
        LEFT JOIN cms_users lawyer ON c.assigned_to = lawyer.id
        WHERE 1
    ";

    // filter conditions
    switch ($filter) {
        case 'today':
            $sql .= " AND DATE(c.created_at) = CURDATE()";
            break;

        case 'this_week':
            $sql .= " AND YEARWEEK(c.created_at, 1) = YEARWEEK(CURDATE(), 1)";
            break;

        case 'this_month':
            $sql .= " AND YEAR(c.created_at) = YEAR(CURDATE()) 
                      AND MONTH(c.created_at) = MONTH(CURDATE())";
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid filter option']);
            exit;
    }

    $sql .= " ORDER BY c.created_at DESC LIMIT 200";

    $stmt = $pdo->query($sql);
    $cases = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'filter'  => $filter,
        'count'   => count($cases),
        'cases'   => $cases
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
