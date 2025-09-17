<?php 
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php';
require_once dirname(__DIR__) . '/apis/auth/session-bootstrap.php';

header("Content-Type: application/json");

//check if request method not equals post then echo json response
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}
//wrap everything in try catch block
try {
    //get the raw post data
    $postData = file_get_contents('php://input');
    //decode the json data
    $data = json_decode($postData, true);

    //create pdo instance
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $adminId   = $_SESSION['sauth']['id']    ?? null;
    $adminName = $_SESSION['sauth']['name']  ?? 'Unknown';
    $adminMail = $_SESSION['sauth']['email'] ?? 'Unknown';

    //check if department_id is set
    if (!isset($data['department_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Department ID is required.']);
        http_response_code(400);
        log_activity($pdo, $adminId, 'DELETE DEPARTMENT', 'Failed - Department ID missing');

        exit;
    }

    //check if admin is logged in
    if (empty($adminId)) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please log in.']);
        http_response_code(401);
        exit;
    }

    $departmentId = intval($data['department_id']);

    //prepare and execute the delete query
    $stmt = $pdo->prepare("DELETE FROM cms_departments WHERE id = :id");
    $stmt->bindParam(':id', $departmentId, PDO::PARAM_INT);
    $stmt->execute();

    //check if any row was affected
    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Department deleted successfully.']);
        log_activity($pdo, $adminId, 'DELETE DEPARTMENT', 'Admin with ID '. $adminId . ' delete Department');

        //UPDATE DEPARTMENT COLUMN TO NULL ON cms_users table
        // $update = "UPDATE cms_users SET department= NULL WHERE department=:department";
        // $pdo->prepare($update);

        // $stmt = $pdo->execute([':department' => $departmentName]);


        http_response_code(200);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Department not found or already deleted.']);
        log_activity($pdo, $adminId, 'DELETE DEPARTMENT', 'Failed - Not found, Department user tries to delete is not found');
        http_response_code(404);
    }
} catch (Exception $e) {
    //catch any exception and return error message
    echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
    http_response_code(500);
    if (isset($pdo)) {
        log_activity($pdo, $adminId ?? null, 'DELETE DEPARTMENT', 'Error - ' . $e->getMessage(), $adminName ?? 'Unknown');
    }
}