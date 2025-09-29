<?php
require_once dirname(__DIR__, 2) . '/inc/db.php';
header("Content-Type: application/json");
session_start();

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "No active session"
        ]);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $username = $_SESSION['username'] ?? 'unknown';

    // Log the logout
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $stmt = $pdo->prepare("
        INSERT INTO cms_activity_logs
            (user_id, action, description, ip_address, user_agent, module, status, created_at)
        VALUES
            (:user_id, :action, :description, :ip, :ua, :module, :status, NOW())
    ");
    $stmt->execute([
        ":user_id"    => $userId,
        ":action"     => "LOGOUT",
        ":description"=> "User logged out: {$username}",
        ":ip"         => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ":ua"         => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        ":module"     => "Users",
        ":status"     => "SUCCESS"
    ]);

    // Destroy session
    session_unset();
    session_destroy();

    echo json_encode([
        "success" => true,
        "message" => "Logout successful"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
