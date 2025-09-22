<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location
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
    // Secure PDO connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Fetch latest 9 cases with assigned user name
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
            c.assigned_to,
            u.full_name AS assigned_name,
            c.court_date,
            c.resolution_date,
            c.created_at
        FROM cms_cases c
        LEFT JOIN cms_users u ON c.assigned_to = u.id
        ORDER BY c.created_at DESC
        LIMIT 9
    ";

    $stmt = $pdo->query($sql);
    $cases = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "message" => "Cases fetched successfully",
        "data" => $cases
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
