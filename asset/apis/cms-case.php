<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    // Connect with PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Pagination params
    $page  = isset($_GET['page']) && is_numeric($_GET['page']) ? (int) $_GET['page'] : 1;
    $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? (int) $_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;

    // Count total cases
    $countSql = "SELECT COUNT(*) FROM cms_cases";
    $total = (int) $pdo->query($countSql)->fetchColumn();

    // Fetch paginated cases with assigned lawyer + filer names
    $sql = "
        SELECT 
            c.id,
            c.case_number,
            c.title,
            c.status,
            c.case_type,
            c.created_at,
            c.updated_at,
            u1.full_name AS assigned_lawyer,
            u2.full_name AS filed_by_name
        FROM cms_cases c
        LEFT JOIN cms_users u1 ON c.assigned_to = u1.id
        LEFT JOIN cms_users u2 ON c.filed_by = u2.id
        ORDER BY c.created_at DESC
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
    $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
    $stmt->execute();
    $cases = $stmt->fetchAll();

    echo json_encode([
        "status"        => "success",
        "total_results" => $total,
        "current_page"  => $page,
        "per_page"      => $limit,
        "cases"         => $cases
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
