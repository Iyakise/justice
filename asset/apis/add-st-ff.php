<?php
require_once dirname(__DIR__) . '/inc/db.php'; // adjust path to your DB connection
require_once dirname(__DIR__) . '/inc/api-key.php'; //api key file
require_once dirname(__DIR__) . '/inc/function.php'; //add functions file
header("Content-Type: application/json");

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only POST requests allowed."]);
    exit;
}

// Get raw JSON input
$data = json_decode(file_get_contents("php://input"), true);
// Generate a secure temporary password
$tempPassword = bin2hex(random_bytes(8));
$password = password_hash($tempPassword, PASSWORD_DEFAULT);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "Invalid JSON input."]);
    exit;
}

// Required fields
$required = ["fullName", "email", "phone", "role", "status"];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(422);
        echo json_encode(["status" => false, "message" => "Missing field: $field"]);
        exit;
    }
}

try {

    // Secure PDO
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);


    $sql = "INSERT INTO cms_users 
        (full_name, email, phone, password, role, department, status, created_at, updated_at)
        VALUES (:full_name, :email, :phone, :password, :role, :department, :status, NOW(), NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":full_name"  => trim($data["fullName"]),
        ":email"      => strtolower(trim($data["email"])),
        ":phone"      => trim($data["phone"]),
        ":password"   => $password,
        ":role"       => trim($data["role"]),
        ":department" => trim($data['departments']),
        ":status"     => trim($data['status'])
    ]);


    // Send welcome email to the new user USING PHPMAILER AND HEREDOC SYNTAX
$root = __ROOT__();
$fullName   = $data['fullName'];        // Staff name from input
$tempPass   = $tempPassword;                // Generated temporary password
$resetLink  = "${root}reset-password"; 
$loginLink  = "${root}login.html";
$appName = __SITE_NAME__;
/*
<div style=\"background-color:#f9f9f9; padding:20px; text-align:center;\">
            <a href=\"{$baseUrl}\" target=\"_blank\" style=\"text-decoration:none;\">
                <img src=\"{$baseUrl}asset/img/logo.png\" 
                    alt=\"XpertsBridge Logo\" 
                    style=\"max-width:200px; height:auto; display:block; margin:0 auto;\">
            </a>
            <p style=\"font-family:Arial, sans-serif; font-size:14px; color:#555; margin-top:10px;\">
                Empowering Learning, Connecting Experts 🚀
            </p>
        </div>
*/
// Build email message using HEREDOC
$message = <<<EOD

        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4CAF50;">$appName</h2>
            <img src="{$root}asset/img/AKS-Emblem.png" alt="$appName Logo" style="height: 50px;">
        </div>
        <p>Hello <b>{$fullName},</b></p>

        <p>Welcome to the $appName System 🎉 </p>

        <p>Your staff account has been created successfully.   </p>
        <p>A temporary password has been generated for you: </p>

        <p>Temporary Password: <b>{$tempPass}</b> </p>

        <p>For your security, please reset your password before logging in.  
        Click the link below to reset your password: </p>

        <p>{$resetLink} </p>

        <p>After resetting, you can log in here:   </p>
        <p>{$loginLink} </p>

        <p>If you did not expect this account creation, please contact the system administrator immediately.</p>

        <p>Regards,</p>
        <p>$appName Team</p>
EOD;

// Example: Send email with mail()
$subject = "Your $appName Account";
// $headers = "From: noreply@example.com\r\n";
// $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

//define email message
define('XPERT_TO_USERNAME', $fullName);
define('XPERT_FROM_NAME', $fullName);
define('XPERT_EMAIL_SUBJECT', $subject);
define('XPERT_MAIL_CONTENT_PLAN', $message);
define('XPERT_MAIL_CONTENT_HTML', $message);

// require_once dirname(__DIR__) . '/inc/send-email.php'; // Ensure function is included

sendEmail(
    $data['email'],
    $fullName,
    __SITE_NAME__,
    $subject,
    $message,
    $message
);

/*
    string $toEmail,
    string $toName,
    // string $fromEmail,
    string $fromName,
    string $subject,
    string $textBody,
    string $htmlBody
*/

    echo json_encode(["status" => true, "message" => "User added successfully, an email has been sent with login details."]);
    http_response_code(201);


}catch (PDOException $e) {
    http_response_code(500);

    // Check if it's a duplicate entry error
    if ($e->getCode() == 23000 && str_contains($e->getMessage(), '1062')) {
        echo json_encode([
            "status" => false,
            "message" => "The email address is already registered. Please use a different email."
        ]);
    } else {
        echo json_encode([
            "status" => false,
            "message" => "Server error: " . $e->getMessage()
        ]);
    }
}

