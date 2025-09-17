<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust path
header("Content-Type: application/json");

// Allow only GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only GET requests allowed."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Fetch last 10 users by created_at DESC
    $sql = "SELECT id, full_name, email, phone, role, department, status, created_at 
            FROM cms_users 
            ORDER BY created_at DESC 
            LIMIT 20";
    $stmt = $pdo->query($sql);
    $users = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "count"  => count($users),
        "data"   => $users
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Server error: " . $e->getMessage()]);
}
