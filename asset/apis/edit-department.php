<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php';
require_once dirname(__DIR__) . '/apis/auth/session-bootstrap.php';


header("Content-Type: application/json");

// Only allow PUT or POST (depending on your frontend)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only POST requests allowed."]);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

// echo json_encode($input);
// die;
$id              = (int)($input['deptId'] ?? 0);
$title           = trim($input['deptName'] ?? '');
$description     = trim($input['description'] ?? '');
$department_code = !empty($input['deptcode']) ? trim($input['deptcode']) : null;
$department_head = !empty($input['depthead']) ? trim($input['depthead']) : null;

if ($id <= 0 || $title === '' || $description === '') {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "id, title, and description are required"]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Capture session user *before* destroying session
$adminId   = $_SESSION['sauth']['id']    ?? null;
$adminName = $_SESSION['sauth']['name']  ?? 'Unknown';
$adminMail = $_SESSION['sauth']['email'] ?? 'Unknown';

    // Prepare update query
    $sql = "UPDATE cms_departments 
            SET title = :title,
                description = :description,
                department_code = :department_code,
                department_head = :department_head,
                updated_at = NOW()
            WHERE id = :id";

    $stmt = $pdo->prepare($sql);

    $success = $stmt->execute([
        ':title'           => $title,
        ':description'     => $description,
        ':department_code' => $department_code,
        ':department_head' => $department_head,
        ':id'              => $id
    ]);

    if ($success) {
        echo json_encode([
            "status" => true,
            "message" => "Department updated successfully"
        ]);
        log_activity($pdo, $adminId, 'EDIT DEPARTMENT', $description);
        http_response_code(201);
    } else {
        echo json_encode([
            "status" => false,
            "message" => "Update failed"
        ]);
        log_activity($pdo, $adminId, 'EDIT DEPARTMENT', 'FAIL TO EDIT DEPARTMENT '.$title, 'FAILED');
        http_response_code(402);

    }

} catch (PDOException $e) {
    http_response_code(500);
        log_activity($pdo, $adminId, 'EDIT DEPARTMENT', 'UNEXPECTED ERROR OCCUR WHILE TYING TO UPDATE '.$title, 'FAILED');

    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
