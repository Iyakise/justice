<?php
require_once dirname(__DIR__, 2) . '/inc/db.php';
header("Content-Type: application/json");

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "status" => false,
        "message" => "Only GET requests allowed."
    ]);
    exit;
}

try {
    // Secure PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get case_id from query string
    $caseId = $_GET['case_id'] ?? null;
    if (!$caseId || !is_numeric($caseId)) {
        http_response_code(422);
        echo json_encode([
            "status" => false,
            "message" => "Valid case_id is required."
        ]);
        exit;
    }

    // SQL to fetch case details
    $sql = "
        SELECT 
            c.id,
            c.case_number,
            c.title,
            c.description,
            c.case_type,
            c.status,
            c.priority,
            c.filed_by,
            fb.full_name AS filed_by_name,
            c.assigned_to,
            at.full_name AS assigned_name,
            c.court_date,
            c.resolution_date,
            c.created_at,
            c.updated_at
        FROM cms_cases c
        LEFT JOIN cms_users fb ON c.filed_by = fb.id
        LEFT JOIN cms_users at ON c.assigned_to = at.id
        WHERE c.id = :case_id
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':case_id' => $caseId]);
    $case = $stmt->fetch();

    if (!$case) {
        http_response_code(404);
        echo json_encode([
            "status" => false,
            "message" => "Case not found."
        ]);
        exit;
    }

    echo json_encode([
        "status" => true,
        "message" => "Case fetched successfully",
        "data" => $case
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
