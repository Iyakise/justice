<?php
require_once dirname(__DIR__) . '/inc/db.php';
require_once dirname(__DIR__) . '/inc/function.php'; // include your mailer() helper
require_once dirname(__DIR__) . '/inc/api-key.php'; // include api helper
// require_once dirname(__DIR__) . '/vendor/autoload.php'; // PHPMailer if needed

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
    $email = trim($input['email'] ?? '');
    $type = trim($input['type'] ?? '');

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(["status" => false, "message" => "Valid email is required."]);
        exit;
    }

    // Check if email belongs to admin
    $stmt = $pdo->prepare("SELECT id, name, email FROM super_admins WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch();

    $user = null;
    if (!$admin) {
        // Check if email belongs to a normal user
        $stmt = $pdo->prepare("SELECT id, full_name, email FROM cms_users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
    }

    if (!$admin && !$user) {
        http_response_code(404);
        echo json_encode(["status" => false, "message" => "Email not found."]);
        exit;
    }

    // Generate token
    $token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Insert into password reset table
    $stmt = $pdo->prepare("
        INSERT INTO cms_password_resets (admin_id, user_id, token, expires_at)
        VALUES (:admin_id, :user_id, :token, :expires_at)
    ");
    $stmt->execute([
        ':admin_id'   => $admin ? $admin['id'] : null,
        ':user_id'    => $user ? $user['id'] : null,
        ':token'      => $token,
        ':expires_at' => $expires_at
    ]);

    // Build reset link
    $resetLink = __ROOT__() ."reset-password/new-pwd.html?token=" . urlencode($token) . '&r=' . $type;
    $root      = __ROOT__();
    // Recipient info
    $recipientName  = $admin ? $admin['name'] : $user['full_name'];
    $recipientEmail = $admin ? $admin['email'] : $user['email'];
    $appName = __SITE_NAME__;
    // Email body
    $subject = "Password Reset Instructions";

    $body = "
        <div style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">
        <div style=\"background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px;\">
            <h2 style=\"color: #4CAF50;\">$appName</h2>
            <img src=\"{$root}asset/img/AKS-Emblem.png\" alt=\"$appName Logo\" style=\"height: 50px;\">
        </div>

        Dear {$recipientName},<br><br>
        We received a request to reset the password for your account.  
        To proceed, please click the secure link below. This link will remain valid for the next 1 hour:<br><br>
        <a href='{$resetLink}'>Reset Your Password</a><br><br>
        if the link is not working kindly copy this link to your browser url: $resetLink.<br><br><br>
        If you did not initiate this request, no action is required and you may safely disregard this email.<br><br>
        Best regards,<br>
        The Support Team
    ";


    // Send email (using your mailer helper)
    if (!sendEmail($recipientEmail, $recipientName, SENDER_EMAIL_ADDRESS, __SITE_NAME__, $subject, $body, $body)) {
        http_response_code(500);
        echo json_encode(["status" => false, "message" => "Failed to send reset email."]);
        exit;
    }
    /**
 * Send an email via SendGrid.
 *
 * @param string $toEmail   Recipient email address
 * @param string $toName    Recipient name
 * @param string $fromEmail Sender email address
 * @param string $fromName  Sender name
 * @param string $subject   Email subject
 * @param string $textBody  Plain-text body
 * @param string $htmlBody  HTML body
 * @return bool             True on success, false on failure
 */

    echo json_encode([
        "status"  => true,
        "message" => "Password reset link sent to {$recipientEmail}"
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Server error: " . $e->getMessage()]);
    exit;
}
