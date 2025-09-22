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

    // Check if search query is provided
    $query = $_GET['query'] ?? '';
    if (empty(trim($query))) {
        http_response_code(422);
        echo json_encode([
            "status" => false,
            "message" => "Search query is required."
        ]);
        exit;
    }

    // SQL to search by case title or case number
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
        WHERE c.title LIKE :search OR c.case_number LIKE :search
        ORDER BY c.created_at DESC LIMIT 4
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':search' => "%" . $query . "%"]);
    $cases = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "count"  => count($cases),
        "message" => "Search results",
        "data" => $cases
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
