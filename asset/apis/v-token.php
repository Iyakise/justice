<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only GET requests are allowed."]);
    exit;
}

// Validate token parameter
if (!isset($_GET['token']) || empty(trim($_GET['token']))) {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "Token is required."]);
    exit;
}

$token = trim($_GET['token']);

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $sql = "SELECT id, user_id,admin_id, expires_at 
            FROM cms_password_resets 
            WHERE token = :token 
            LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':token' => $token]);
    $resetRow = $stmt->fetch();

    if (!$resetRow) {
        http_response_code(404);
        echo json_encode(["status" => false, "message" => "Invalid token."]);
        exit;
    }

    // Check expiry
    if (new DateTime() > new DateTime($resetRow['expires_at'])) {
        http_response_code(410); // 410 Gone
        echo json_encode(["status" => false, "message" => "Token has expired."]);
        exit;
    }

    echo json_encode([
        "status" => true,
        "message" => "Token is valid.",
        "data" => [
            "reset_id" => $resetRow['id'],
            "user_id" => ['user_id' => $resetRow['user_id'], 'admin_id' => $resetRow['admin_id']],
            "expires_at" => $resetRow['expires_at']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Server error: " . $e->getMessage()]);
}
