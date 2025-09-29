<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location
header("Content-Type: application/json");

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only GET requests allowed."]);
    exit;
}

try {
    // Secure PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Fetch all departments
    $sql = "SELECT id, title, description, created_at, updated_at 
            FROM cms_departments 
            ORDER BY created_at DESC LIMIT 100";
    $stmt = $pdo->query($sql);
    $departments = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "message" => "Departments fetched successfully",
        "data" => $departments
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
