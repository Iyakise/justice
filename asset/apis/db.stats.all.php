<?php
require_once dirname(__DIR__) . '/inc/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only GET allowed."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Count total cases
    $totalCases = $pdo->query("SELECT COUNT(*) FROM cms_cases")->fetchColumn();

    // ✅ Count pending cases
    $pendingCases = $pdo->query("SELECT COUNT(*) FROM cms_cases WHERE status = 'pending' || status = 'In Progress' || status = 'On Hold'")->fetchColumn();

    // ✅ Count resolved cases
    $resolvedCases = $pdo->query("SELECT COUNT(*) FROM cms_cases WHERE status = 'resolved' OR status = 'closed'")->fetchColumn();

    // ✅ Count total activity logs
    $totalLogs = $pdo->query("SELECT COUNT(*) FROM cms_activity_logs")->fetchColumn();

    // ✅ Count total activity logs
    $totalUsers = $pdo->query("SELECT COUNT(*) FROM cms_users")->fetchColumn();

    echo json_encode([
        "success" => true,
        "data" => [
            "total_cases"    => intval($totalCases),
            "pending_cases"  => intval($pendingCases),
            "resolved_cases" => intval($resolvedCases),
            "activity_logs"  => intval($totalLogs),
            "total_users"    => intval($totalUsers)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
