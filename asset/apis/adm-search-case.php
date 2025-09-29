<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    // Connect with PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get search term
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';
    if ($search === '') {
        echo json_encode([
            "status" => "error",
            "message" => "Search term is required (case number or title)."
        ]);
        exit;
    }

    // Pagination params
    $page  = isset($_GET['page']) && is_numeric($_GET['page']) ? (int) $_GET['page'] : 1;
    $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? (int) $_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;

    // Count total results
    $countSql = "
        SELECT COUNT(*) 
        FROM cms_cases c
        LEFT JOIN cms_users u ON c.assigned_to = u.id
        WHERE c.case_number LIKE :search OR c.title LIKE :search
    ";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute([":search" => "%" . $search . "%"]);
    $total = $countStmt->fetchColumn();

    // Fetch paginated results with assigned person’s name
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
        WHERE c.case_number LIKE :search OR c.title LIKE :search
        ORDER BY c.created_at DESC
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(":search", "%" . $search . "%", PDO::PARAM_STR);
    $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
    $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
    $stmt->execute();

    $cases = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "search_term" => $search,
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
