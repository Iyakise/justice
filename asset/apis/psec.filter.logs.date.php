<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

// ✅ Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only POST allowed."]);
    exit;
}

try {
    // ✅ Connect DB
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Parse incoming JSON
    $input = json_decode(file_get_contents("php://input"), true);
    $date = trim($input['date'] ?? '');
    $actionType = strtolower(trim($input['action_type'] ?? ''));

    if (empty($date)) {
        http_response_code(400);
        echo json_encode(["error" => "Date is required"]);
        exit;
    }

    // ✅ Build base query
    $query = "
        SELECT 
            l.id,
            l.user_id,
            l.action,
            l.description,
            l.ip_address,
            l.user_agent,
            l.module,
            l.status,
            l.created_at,
            COALESCE(u.full_name, s.name) AS user_name,
            COALESCE(u.email, s.email) AS user_email,
            COALESCE(u.role, s.role) AS user_role
        FROM cms_activity_logs l
        LEFT JOIN cms_users u ON l.user_id = u.id
        LEFT JOIN super_admins s ON l.user_id = s.id
        WHERE DATE(l.created_at) = :date
    ";

    $params = [":date" => $date];

    // ✅ Filter by action type (if not "all types")
    if (!empty($actionType) && $actionType !== "all types") {
        $query .= " AND LOWER(l.action) LIKE :action_type";
        $params[":action_type"] = '%' . $actionType . '%';
    }

    $query .= " ORDER BY l.created_at DESC";

    // ✅ Execute
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();

    if (!$logs) {
        echo json_encode([
            "success" => false,
            "message" => "No activity logs found for the selected filters"
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "count" => count($logs),
        "filters" => [
            "date" => $date,
            "action_type" => $actionType
        ],
        "data" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Server error: " . $e->getMessage()
    ]);
}
