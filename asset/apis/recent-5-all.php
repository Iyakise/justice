<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Last 5 users
    $stmtUsers = $pdo->query("
        SELECT full_name, created_at 
        FROM cms_users 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $users = $stmtUsers->fetchAll();

    // Last 5 cases
    $stmtCases = $pdo->query("
        SELECT case_number, created_at 
        FROM cms_cases 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $cases = $stmtCases->fetchAll();

    // Last 5 departments
    $stmtDepts = $pdo->query("
        SELECT title, created_at 
        FROM cms_departments 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $departments = $stmtDepts->fetchAll();

    // Last 5 activity logs
    $stmtLogs = $pdo->query("
        SELECT user_id, action, module, status, created_at 
        FROM cms_activity_logs 
        ORDER BY created_at DESC 
        LIMIT 8
    ");
    $logs = $stmtLogs->fetchAll();

    echo json_encode([
        'recent_users' => $users,
        'recent_cases' => $cases,
        'recent_departments' => $departments,
        'recent_activity_logs' => $logs
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
