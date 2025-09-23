<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status"  => false,
        "message" => "Only POST requests allowed."
    ]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $input = json_decode(file_get_contents("php://input"), true);

    $token       = $input['token']       ?? null;
    $newPassword = $input['new_password'] ?? null;

    if (!$token || !$newPassword) {
        http_response_code(422);
        echo json_encode([
            "status"  => false,
            "message" => "Token and new password are required."
        ]);
        exit;
    }

    // Check reset request
    $stmt = $pdo->prepare("SELECT * FROM cms_password_resets WHERE token = :token LIMIT 1");
    $stmt->execute([":token" => $token]);
    $reset = $stmt->fetch();

    if (!$reset) {
        http_response_code(400);
        echo json_encode([
            "status"  => false,
            "message" => "Invalid or expired reset token."
        ]);
        exit;
    }

    // Expired?
    if (strtotime($reset['expires_at']) < time()) {
        // delete expired token
        $pdo->prepare("DELETE FROM cms_password_resets WHERE id = :id")->execute([":id" => $reset['id']]);
        http_response_code(400);
        echo json_encode([
            "status"  => false,
            "message" => "Reset link has expired."
        ]);
        exit;
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // First try updating in cms_admins
    $stmt = $pdo->prepare("UPDATE super_admins SET password = :pwd WHERE id = :id");
    $stmt->execute([":pwd" => $hashedPassword, ":id" => $reset['user_id']]);

    if ($stmt->rowCount() === 0) {
        // If not admin, update cms_users
        $stmt = $pdo->prepare("UPDATE cms_users SET password = :pwd WHERE id = :id");
        $stmt->execute([":pwd" => $hashedPassword, ":id" => $reset['user_id']]);
    }

    // Delete token after use
    $pdo->prepare("DELETE FROM cms_password_resets WHERE id = :id")->execute([":id" => $reset['id']]);

    echo json_encode([
        "status"  => true,
        "message" => "Password has been reset successfully."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => false,
        "message" => "Unexpected error: " . $e->getMessage()
    ]);
}
