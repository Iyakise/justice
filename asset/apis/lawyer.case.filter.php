<?php
// filter_cases_by_status.php
require_once dirname(__DIR__) . '/inc/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get lawyer_id (from session or query param)
    $lawyer_id = isset($_GET['lawyer_id']) ? intval($_GET['lawyer_id']) : 0;
    $status    = isset($_GET['status']) ? trim($_GET['status']) : '';

$pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    if ($lawyer_id <= 0 || empty($status)) {
        echo json_encode([
            "success" => false,
            "message" => "Lawyer ID and status are required."
        ]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT 
                c.id,
                c.case_number,
                c.title,
                c.status,
                u.full_name AS client_name,
                c.assigned_to,
                l.full_name AS lawyer_name,
                c.created_at AS date_assigned,
                c.created_at,
                c.court_date AS deadline
            FROM cms_cases c
            LEFT JOIN cms_users u ON c.filed_by = u.id
            LEFT JOIN cms_users l ON c.assigned_to = l.id
            WHERE c.assigned_to = ? AND c.status = ?
            ORDER BY c.created_at DESC
        ");

        $stmt->execute([$lawyer_id, $status]);
        $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "status"  => $status,
            "count"   => count($cases),
            "cases"   => $cases
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
}

