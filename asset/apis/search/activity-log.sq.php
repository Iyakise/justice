<?php
require_once dirname(__DIR__, 2) . '/inc/db.php'; // adjust to your db.php location

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status'  => false,
        'message' => 'Method Not Allowed'
    ]);
    exit;
}

try {
    // Connect to DB
       // Create PDO connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get query params
    $query = isset($_GET['query']) ? trim($_GET['query']) : '';
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    $dateFrom = isset($_GET['date_from']) ? $_GET['date_from'] : null;
    $dateTo = isset($_GET['date_to']) ? $_GET['date_to'] : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;

    // Base SQL
    $sql = "SELECT * FROM activity_logs WHERE 1=1";
    $params = [];

    // Add filters
    if ($query !== '') {
        $sql .= " AND (action LIKE :query OR description LIKE :query)";
        $params[':query'] = "%$query%";
    }
    if ($userId) {
        $sql .= " AND user_id = :user_id";
        $params[':user_id'] = $userId;
    }
    if ($dateFrom && $dateTo) {
        $sql .= " AND created_at BETWEEN :date_from AND :date_to";
        $params[':date_from'] = $dateFrom;
        $params[':date_to'] = $dateTo;
    }

    $sql .= " ORDER BY created_at DESC LIMIT :limit";
    $stmt = $pdo->prepare($sql);

    // Bind params safely
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "count" => count($logs),
        "logs" => $logs
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
