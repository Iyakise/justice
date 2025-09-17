<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location
header("Content-Type: application/json");

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only GET requests allowed."]);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "Valid department ID is required."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $sql = "SELECT id, title, description, department_code, department_head, created_at, updated_at 
            FROM cms_departments 
            WHERE id = :id
            LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $department = $stmt->fetch();

    if ($department) {
        echo json_encode([
            "status" => true,
            "data" => $department
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["status" => false, "message" => "Department not found."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
