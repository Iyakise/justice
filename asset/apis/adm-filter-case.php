<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    // Connect with PDO
    // Connect with PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get case status filter
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    if ($status === '') {
        echo json_encode([
            "status" => "error",
            "message" => "Case status is required."
        ]);
        exit;
    }

    // Optional: pagination
    $page  = isset($_GET['page']) && is_numeric($_GET['page']) ? (int) $_GET['page'] : 1;
    $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? (int) $_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;

    // Count total cases with this status
    $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM cms_cases WHERE status = :status");
    $countStmt->execute([":status" => $status]);
    $total = $countStmt->fetchColumn();

    // Fetch filtered cases with pagination
    // $sql = "
    //     SELECT id, case_number, title, status, created_at, updated_at
    //     FROM cms_cases
    //     WHERE status = :status
    //     ORDER BY created_at DESC
    //     LIMIT :limit OFFSET :offset
    // ";

    $sql = "
        SELECT 
            c.id, 
            c.case_number, 
            c.title, 
            c.status, 
            c.created_at, 
            c.updated_at,
            u.full_name AS assigned_person
        FROM cms_cases c
        LEFT JOIN cms_users u ON c.assigned_to = u.id
        WHERE c.status = :status ORDER BY c.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(":status", $status, PDO::PARAM_STR);
    $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
    $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
    $stmt->execute();

    $cases = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "filter_status" => $status,
        "total_results" => (int) $total,
        "current_page" => $page,
        "per_page" => $limit,
        "cases" => $cases
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unexpected error: " . $e->getMessage()
    ]);
}
