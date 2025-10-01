<?php
require_once dirname(__DIR__) . '/inc/db.php'; // DB connection
require_once dirname(__DIR__) . '/inc/function.php'; // helper functions
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php';
require_once dirname(__DIR__) . '/apis/auth/session-bootstrap.php';
// require_once dirname(__DIR__) . '/inc/mailer.php'; // <-- include your PHPMailer config

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status'  => false,
        'message' => 'Method Not Allowed'
    ]);
    exit;
}

try {
    $adminId   = $_SESSION['sauth']['id']    ?? null;
    $adminName = $_SESSION['sauth']['name']  ?? 'Unknown';
    $adminMail = $_SESSION['sauth']['email'] ?? 'Unknown';
    // Create PDO connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get request body (JSON expected)
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'status'  => false,
            'message' => 'Invalid JSON input'
        ]);
        exit;
    }

    // Extract & sanitize values
    $case_number     = $input['case_number']     ?? null;
    $title           = $input['title']           ?? null;
    $description     = $input['description']     ?? null;
    $case_type       = $input['case_type']       ?? null;
    $status          = $input['status']          ?? 'Open';
    $priority        = $input['priority']        ?? 'Medium';
    $filed_by        = $input['filed_by']        ?? null;
    $assigned_to     = $input['assigned_to']     ?? null;
    $court_date      = $input['courtDte']        ?? null;
    $resolution_date = $input['resolution_date'] ?? null;

    // Basic validation
    if (!$case_number || !$title || !$case_type) {
        http_response_code(422);
        echo json_encode([
            'status'  => false,
            'message' => 'case_number, title and case_type are required'
        ]);
            log_activity($pdo, $adminId, 'CASE FAIL', 'FAIL TO RECORD NEW CASE '.$title);

        exit;
    }

    // Insert query
    $stmt = $pdo->prepare("
        INSERT INTO cms_cases 
        (case_number, title, description, case_type, status, priority, filed_by, assigned_to, court_date, resolution_date) 
        VALUES 
        (:case_number, :title, :description, :case_type, :status, :priority, :filed_by, :assigned_to, :court_date, :resolution_date)
    ");

    $stmt->execute([
        ':case_number'     => $case_number,
        ':title'           => $title,
        ':description'     => $description,
        ':case_type'       => $case_type,
        ':status'          => $status,
        ':priority'        => $priority,
        ':filed_by'        => $filed_by ?: null,
        ':assigned_to'     => $assigned_to ?: null,
        ':court_date'      => $court_date ?: null,
        ':resolution_date' => $resolution_date ?: null
    ]);

    log_activity(
        $pdo, 
        $adminId, 
        'CASE ADD', 
        $adminName .' RECORD RECORD NEW CASE '. $title, 'SUCCESS');
    // log_activity($pdo, 
    //             $adminId, 
    //             'CASE FAIL', 
    //             `$adminName RECORD RECORD NEW CASE $title`, 
    //             'FAILED');
    $currentCaseid = $pdo->lastInsertId();
    $progress = new CaseProgress($pdo);
    $progress->addProgress($currentCaseid, $adminId, $status,'Case created By '.$adminName);
    $progress->addProgress($currentCaseid, $adminId, $status, $adminName . ' Assigned this case to you');

    $caseId = $currentCaseid;
    $appName = __SITE_NAME__;
    $root = __ROOT__();

    // ✅ Send email to assigned lawyer/admin if assigned_to is set
    if ($assigned_to) {
        $userStmt = $pdo->prepare("SELECT full_name, email FROM cms_users WHERE id = :id LIMIT 1");
        $userStmt->execute([':id' => $assigned_to]);
        $lawyer = $userStmt->fetch();

        if ($lawyer) {
            $toEmail = $lawyer['email'];
            $toName  = $lawyer['full_name'];

            // Prepare email content (using HEREDOC for template)
            $subject = "New Case Assigned: {$title}";
            $body = <<<EMAIL
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #4CAF50;">$appName</h2>
                        <img src="{$root}asset/img/AKS-Emblem.png" alt="$appName Logo" style="height: 50px;">
                    </div>
                </div>

                <h2>New Case Assigned to You</h2>
                <p>Dear {$toName},</p>
                <p>You have been assigned a new case in the $appName:</p>
                <ul>
                    <li><strong>Case Number:</strong> {$case_number}</li>
                    <li><strong>Title:</strong> {$title}</li>
                    <li><strong>Case Type:</strong> {$case_type}</li>
                    <li><strong>Priority:</strong> {$priority}</li>
                    <li><strong>Status:</strong> {$status}</li>
                </ul>
                <p>Please log in to the system to review details and proceed.</p>
                <p>Regards,<br>Case Management System</p>
            EMAIL;

            // Send email via PHPMailer
            define('XPERT_TO_USERNAME', $toName);
            define('XPERT_FROM_NAME', $appName);
            define('XPERT_EMAIL_SUBJECT', $subject);
            define('XPERT_MAIL_CONTENT_PLAN', $body);
            define('XPERT_MAIL_CONTENT_HTML', $body);

            log_activity(
                $pdo, 
                $assigned_to, 
                'CASE ADD', 
                $adminName .' ASSIGNED NEW CASE TO YOU '. $title, 'SUCCESS'
            );

            sendEmail(
                $toEmail,
                $toName,
                __SITE_NAME__,
                $subject,
                $body,
                $body
            );


        }
    }

    echo json_encode([
        'status'  => true,
        'message' => 'Case created successfully',
        'case_id' => $caseId
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => false,
        'message' => 'Unexpected error: ' . $e->getMessage()
    ]);
    exit;
}
