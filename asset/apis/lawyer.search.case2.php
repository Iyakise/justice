<?php
require_once dirname(__DIR__) . '/inc/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only GET allowed."]);
    exit;
}

// ✅ Expect lawyer_id (from query string: ?lawyer_id=123)
$lawyer_id = isset($_GET['lawyer_id']) ? intval($_GET['lawyer_id']) : null;

if (!$lawyer_id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing lawyer_id"]);
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
            c.title,
            c.description,
            c.status,
            c.created_at,
            c.updated_at,
            u.full_name AS complainant_name,
            l.full_name AS lawyer_name
        FROM cases c
        LEFT JOIN cms_users u ON c.complainant_id = u.id
        LEFT JOIN cms_users l ON c.assigned_to = l.id
        WHERE c.assigned_to = :lawyer_id
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([':lawyer_id' => $lawyer_id]);
    $cases = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "cases" => $cases
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
