<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Database credentials
require_once dirname(__DIR__, 1) . "/inc/db.php"; 
require_once __DIR__ . "/api-helper.php"; 

$response = [
    "status" => "error",
    "message" => "Something went wrong",
    "data" => null
];

try {
    // Validate input
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("Invalid or missing staff ID");
    }

    $staffId = (int) $_GET['id'];

    // Connect to DB
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Prepare & execute query securely
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            full_name, 
            email, 
            phone, 
            username, 
            role, 
            department, 
            status, 
            created_at, 
            updated_at
        FROM cms_users
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute(['id' => $staffId]);
    $user = $stmt->fetch();

    if ($user) {
        $response['status'] = "success";
        $response['message'] = "Staff found";
        $response['data'] = $user;
    } else {
        $response['status'] = "error";
        $response['message'] = "Staff not found";
    }

} catch (PDOException $e) {
    error_log("DB Error: " . $e->getMessage());
    $response['message'] = "Database error occurred";
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Always return JSON
echo json_encode($response, JSON_PRETTY_PRINT);
