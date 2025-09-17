<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php';
require_once dirname(__DIR__) . '/apis/auth/session-bootstrap.php';


header("Content-Type: application/json");

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only POST requests allowed."]);
    exit;
}

// Get raw JSON input
$data = json_decode(file_get_contents("php://input"), true);

    // ✅ Capture session user *before* destroying session
$adminId   = $_SESSION['sauth']['id']    ?? null;
$adminName = $_SESSION['sauth']['name']  ?? 'Unknown';
$adminMail = $_SESSION['sauth']['email'] ?? 'Unknown';

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "Invalid JSON input."]);
    exit;
}

// Required fields
$title       = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');

// Validate
if ($title === '') {
    http_response_code(422);
    echo json_encode(["status" => false, "message" => "Department title is required."]);
    exit;
}

if (strlen($title) > 100) {
    http_response_code(422);
    echo json_encode(["status" => false, "message" => "Title too long. Max 100 chars."]);
    exit;
}

if (strlen($description) > 500) {
    http_response_code(422);
    echo json_encode(["status" => false, "message" => "Description too long. Max 500 chars."]);
    exit;
}

try {
    // Secure PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Insert department
    $sql = "INSERT INTO cms_departments (title, description, created_at, updated_at)
            VALUES (:title, :description, NOW(), NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':title'       => $title,
        ':description' => $description
    ]);

    echo json_encode(["status" => true, "message" => "Department added successfully"]);
    log_activity($pdo, $adminId, 'ADD DEPARTMENT', 'DEPARTMENT ADDED '.$title);


} catch (PDOException $e) {
    if ($e->getCode() === "23000") {
        // Duplicate entry error
        http_response_code(409);
        echo json_encode(["status" => false, "message" => "A department with this title already exists."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => false, "message" => "Server error: " . $e->getMessage()]);
    }
}
