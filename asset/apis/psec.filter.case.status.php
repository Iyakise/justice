<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

// ✅ Only allow POST
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

    // ✅ Get status input
    $input = json_decode(file_get_contents("php://input"), true);
    $status = trim($input['status'] ?? '');

    if (empty($status)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Case status is required."
        ]);
        exit;
    }

    // ✅ Fetch all cases with given status
    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.case_number,
            c.title,
            c.description,
            c.status,
            c.priority,
            c.court_date,
            c.created_at,
            c.updated_at,
            c.assigned_to,
            lw.full_name AS lawyer_name,
            lw.email AS lawyer_email,
            lw.phone AS lawyer_phone,
            c.filed_by AS complainant_id,
            u.full_name AS complainant_name,
            u.email AS complainant_email,
            u.phone AS complainant_phone
        FROM cms_cases c
        LEFT JOIN cms_users lw ON c.assigned_to = lw.id
        LEFT JOIN cms_users u  ON c.filed_by = u.id
        WHERE LOWER(c.status) = LOWER(:status)
        ORDER BY c.created_at DESC
        LIMIT 100
    ");

    $stmt->execute([':status' => $status]);
    $cases = $stmt->fetchAll();

    if (!$cases) {
        echo json_encode([
            "success" => false,
            "message" => "No cases found for status '{$status}'."
        ]);
        exit;
    }

    // ✅ Return success
    echo json_encode([
        "success" => true,
        "count" => count($cases),
        "status" => $status,
        "data" => $cases
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
