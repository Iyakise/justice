<?php
require_once dirname(__DIR__) . '/inc/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (!isset($_GET['uid']) || empty($_GET['uid'])) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
            exit;
        }

        $userId = intval($_GET['uid']);

        // ✅ DB connection
        $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        // ✅ Query user with latest profile image
        $stmt = $pdo->prepare("
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.username,
                u.role,
                u.department,
                u.status,
                u.created_at,
                u.updated_at,
                pi.file_path AS profile_image
            FROM cms_users u
            LEFT JOIN cms_user_profile_images pi 
                ON u.id = pi.user_id AND pi.is_current = 1
            WHERE u.id = :id
            LIMIT 1
        ");
        $stmt->execute([":id" => $userId]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "user" => $user
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Server error: " . $e->getMessage()]);
    }
}
