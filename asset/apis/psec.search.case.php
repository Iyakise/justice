<?php
require_once dirname(__DIR__) . '/inc/db.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Invalid request method. Use POST.']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $query = isset($input['query']) ? trim((string)$input['query']) : '';

    if ($query === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Search query is required.']);
        exit;
    }

    // DB connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // prepare search params
    $searchLike = '%' . $query . '%';
    $caseId = is_numeric($query) ? (int)$query : 0;

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
            client.full_name AS client_name,
            client.email AS client_email,
            c.assigned_to,
            lawyer.full_name AS lawyer_name,
            c.court_date,
            c.resolution_date,
            c.created_at,
            c.updated_at
        FROM cms_cases c
        LEFT JOIN cms_users client ON c.filed_by = client.id
        LEFT JOIN cms_users lawyer ON c.assigned_to = lawyer.id
        WHERE
            ( :caseId > 0 AND c.id = :caseId )
            OR c.case_number LIKE :search
            OR lawyer.full_name LIKE :search
            OR client.full_name LIKE :search
        ORDER BY c.created_at DESC
        LIMIT 100
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':caseId', $caseId, PDO::PARAM_INT);
    $stmt->bindValue(':search', $searchLike, PDO::PARAM_STR);
    $stmt->execute();

    $results = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'query'   => $query,
        'count'   => count($results),
        'data'    => $results
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
    exit;
}
