<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Total users
    $stmt = $pdo->query("SELECT COUNT(*) AS total_users FROM cms_users");
    $totalUsers = $stmt->fetchColumn();

    // Total departments
    $stmt = $pdo->query("SELECT COUNT(*) AS total_departments FROM cms_departments");
    $totalDepartments = $stmt->fetchColumn();

    // Total logins (successful ones)
    $stmt = $pdo->prepare("SELECT COUNT(*) AS total_logins FROM cms_activity_logs WHERE action = 'LOGIN_SUCCESS'");
    $stmt->execute();
    $totalLogins = $stmt->fetchColumn();

    // Cases registered
    $stmt = $pdo->query("SELECT COUNT(*) AS cases_registered FROM cms_cases");
    $casesRegistered = $stmt->fetchColumn();

    // Cases updated (updated_at different from created_at)
    $stmt = $pdo->query("
        SELECT COUNT(*) AS cases_updated 
        FROM cms_cases 
        WHERE updated_at IS NOT NULL AND updated_at != created_at
    ");
    $casesUpdated = $stmt->fetchColumn();

    echo json_encode([
        "total_users" => (int)$totalUsers,
        "total_departments" => (int)$totalDepartments,
        "total_logins" => (int)$totalLogins,
        "cases_registered" => (int)$casesRegistered,
        "cases_updated" => (int)$casesUpdated
    ]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
