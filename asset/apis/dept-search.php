<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust to your db.php location
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php';
header("Content-Type: application/json");
if($_SERVER['REQUEST_METHOD'] !== 'GET'){
    echo json_encode(['status' => 'error', 'message' => "Request method not allowed"]);
    http_response_code(401);
    die;
}

# search param get here
$q = trim($_GET['Q']);


try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Capture session user *before* destroying session
$adminId   = $_SESSION['sauth']['id']    ?? null;
$adminName = $_SESSION['sauth']['name']  ?? 'Unknown';
$adminMail = $_SESSION['sauth']['email'] ?? 'Unknown';

#search start here
$sql = "SELECT title, id, created_at FROM cms_departments WHERE title LIKE '%$q%'";
// $pdo->prepare($sql);
// $pdo->execute([':query' => $q]);

    $stmt = $pdo->query($sql);
    $departments = $stmt->fetchAll();

echo json_encode([
        "status" => true,
        "message" => "Departments fetched successfully",
        "data" => $departments
    ]);


}catch(PDOException $e){
    http_response_code(500);
        // log_activity($pdo, $adminId, 'DELETE DEPARTMENT', 'UNEXPECTED ERROR OCCUR WHILE TYING TO DELETE '.$title, 'FAILED');

    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}