<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method. Only POST allowed."
    ]);
    exit;
}

try {
    // ✅ Connect to DB
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Get input
    $input = json_decode(file_get_contents("php://input"), true);
    $search = trim($input['search'] ?? '');

    if (empty($search)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Search term is required."
        ]);
        exit;
    }

    // ✅ SQL search logic
    // Search by: Case ID (exact match if numeric), 
    // Lawyer name (partial match), or Complainant name (partial match)
    $query = "
        SELECT 
            c.id,
            c.case_number,
            c.title,
            c.status,
            c.priority,
            c.created_at,
            c.court_date,
            c.assigned_to,
            lw.full_name AS lawyer_name,
            c.filed_by AS complainant_id,
            u.full_name AS complainant_name
        FROM cms_cases c
        LEFT JOIN cms_users lw ON c.assigned_to = lw.id
        LEFT JOIN cms_users u  ON c.filed_by = u.id
        WHERE 1
    ";

    $params = [];

    // If numeric → check by case id
    if (is_numeric($search)) {
        $query .= " AND (c.id = :id OR c.case_number LIKE :case_number)";
        $params[':id'] = intval($search);
        $params[':case_number'] = "%{$search}%";
    } else {
        // Otherwise search by names (lawyer or complainant)
        $query .= " AND (
            lw.full_name LIKE :name OR
            u.full_name LIKE :name OR
            c.case_number LIKE :name OR
            c.title LIKE :name
        )";
        $params[':name'] = "%{$search}%";
    }

    $query .= " ORDER BY c.created_at DESC LIMIT 50";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($results),
        "data" => $results
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
