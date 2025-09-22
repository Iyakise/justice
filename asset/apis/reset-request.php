<?php
require_once dirname(__DIR__) . '/inc/db.php'; 
require_once dirname(__DIR__) . '/inc/function.php'; 
// require_once dirname(__DIR__) . '/inc/phpmailer.php'; // your PHPMailer setup

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only POST requests allowed."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $input = json_decode(file_get_contents("php://input"), true);
    $email = $input['email'] ?? null;

    if (!$email) {
        http_response_code(422);
        echo json_encode(["status" => false, "message" => "Email is required"]);
        exit;
    }

    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id, full_name FROM cms_admins WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);
    $admin = $stmt->fetch();

    if (!$admin) {
        echo json_encode(["status" => false, "message" => "Email not found"]);
        exit;
    }

    // Generate secure token
    $token = bin2hex(random_bytes(32)); 
    $expires_at = date("Y-m-d H:i:s", strtotime("+1 hour"));

    // Save token
    $pdo->prepare("INSERT INTO cms_password_resets (admin_id, token, expires_at) VALUES (:admin_id, :token, :expires_at)")
        ->execute([
            ":admin_id" => $admin['id'],
            ":token" => $token,
            ":expires_at" => $expires_at
        ]);

    // Reset link
    $reset_link = "https://yourdomain.com/reset_password.php?token=$token";

    // Send email with PHPMailer
    $subject = "Password Reset Request";
    $body = "
        <p>Hi {$admin['full_name']},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href='$reset_link'>$reset_link</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
    ";

    if (sendMail($email, $admin['full_name'], $subject, $body)) {
        echo json_encode(["status" => true, "message" => "Password reset link sent"]);
    } else {
        echo json_encode(["status" => false, "message" => "Failed to send email"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Server error: " . $e->getMessage()]);
}
