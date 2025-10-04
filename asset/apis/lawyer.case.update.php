<?php
require_once dirname(__DIR__) . '/inc/db.php';
require_once dirname(__DIR__) . '/inc/function.php'; // your sendEmail() helper
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Read JSON body (POST request)
    $data = json_decode(file_get_contents("php://input"), true);

    $caseId   = isset($data['case_id']) ? (int)$data['case_id'] : 0;
    $lawyerId = isset($data['lawyer_id']) ? (int)$data['lawyer_id'] : 0;
    $status   = isset($data['status']) ? trim($data['status']) : '';
    $remarks  = isset($data['remarks']) ? trim($data['remarks']) : '';

    if ($caseId <= 0 || $lawyerId <= 0 || empty($status)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields (case_id, lawyer_id, status)"
        ]);
        exit;
    }

    // Fetch lawyer name
    $stmt = $pdo->prepare("SELECT full_name FROM cms_users WHERE id = :id LIMIT 1");
    $stmt->execute([":id" => $lawyerId]);
    $lawyer = $stmt->fetch();

    if (!$lawyer) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Lawyer not found"
        ]);
        exit;
    }
    $lawyerName = $lawyer['full_name'];

    // Fetch case details and client info (from correct tables)
    $stmt = $pdo->prepare("
        SELECT 
            c.case_number,
            c.title,
            c.filed_by AS client_id,
            u.full_name AS client_name,
            u.email AS client_email
        FROM cms_cases c
        LEFT JOIN cms_users u ON c.filed_by = u.id
        WHERE c.id = :caseId
        LIMIT 1
    ");
    $stmt->execute([":caseId" => $caseId]);
    $case = $stmt->fetch();

    if (!$case) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Case not found"
        ]);
        exit;
    }

    $caseNumber  = $case['case_number'];
    $caseTitle   = $case['title'];
    $clientId    = $case['client_id'];
    $clientName  = $case['client_name'] ?? null;
    $clientEmail = $case['client_email'] ?? null;

    // Build final remarks (if empty use a default)
    $baseRemarks = $remarks ?: "Status changed to {$status}";
    $finalRemarks = trim($baseRemarks . " (Updated by: Lawyer {$lawyerName})");

    // DB operations: progress insert, activity log insert, update case status
    $pdo->beginTransaction();

    // Insert into cms_case_progress
    $stmt = $pdo->prepare("
        INSERT INTO cms_case_progress (case_id, updated_by, status, remarks, created_at)
        VALUES (:case_id, :updated_by, :status, :remarks, NOW())
    ");
    $stmt->execute([
        ":case_id"   => $caseId,
        ":updated_by"=> $lawyerId,
        ":status"    => $status,
        ":remarks"   => $finalRemarks
    ]);

    // Insert into cms_activity_logs (including ip, user agent, module, status)
    $logStmt = $pdo->prepare("
        INSERT INTO cms_activity_logs 
            (user_id, action, description, ip_address, user_agent, module, status, created_at)
        VALUES 
            (:user_id, :action, :description, :ip, :ua, :module, :status, NOW())
    ");
    $description = "{$lawyerName} updated case #{$caseNumber} (ID: {$caseId}) status to '{$status}'. Remarks: {$baseRemarks}";
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    $logStmt->execute([
        ":user_id" => $lawyerId,
        ":action"  => "case_progress_update",
        ":description" => $description,
        ":ip"      => $ip,
        ":ua"      => $ua,
        ":module"  => "Cases",
        ":status"  => "SUCCESS"
    ]);

    // Update main case status
    $caseUpdate = $pdo->prepare("
        UPDATE cms_cases
        SET status = :status, updated_at = NOW()
        WHERE id = :case_id
    ");
    $caseUpdate->execute([
        ":status"  => $status,
        ":case_id" => $caseId
    ]);

    $pdo->commit();

    // After commit -> send email to client (if email exists)
    $emailSent = false;
    $emailMessage = null;

    if (!empty($clientEmail)) {
        // Compose email
        $subject = "Update on Your Case #{$caseNumber} — {$status}";
        $textBody = "Dear " . ($clientName ?? "Client") . ",\n\n"
            . "This is to inform you that your case (Case Number: {$caseNumber}; Title: {$caseTitle}) has been updated.\n\n"
            . "New Status: {$status}\n"
            . "Remarks: {$baseRemarks}\n"
            . "Updated By: {$lawyerName}\n"
            . "Date: " . date('Y-m-d H:i:s') . "\n\n"
            . "Please log in to your dashboard for more details.\n\nRegards,\n{$lawyerName}";

        $htmlBody = "<p>Dear <strong>" . htmlspecialchars($clientName ?? "Client") . "</strong>,</p>"
            . "<p>Your case <strong>#{$caseNumber}</strong> (&ldquo;".htmlspecialchars($caseTitle)."&rdquo;) has been updated:</p>"
            . "<ul>"
            . "<li><strong>Status:</strong> {$status}</li>"
            . "<li><strong>Remarks:</strong> " . nl2br(htmlspecialchars($baseRemarks)) . "</li>"
            . "<li><strong>Updated By:</strong> {$lawyerName}</li>"
            . "<li><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</li>"
            . "</ul>"
            . "<p>Please log in to your dashboard for more details.</p>"
            . "<p>Regards,<br>{$lawyerName}</p>";

        // Call your sendEmail helper. Use lawyer name as fromName so mail appears from the lawyer.
        try {
            $emailSent = sendEmail(
                $clientEmail,
                $clientName ?? '',
                $lawyerName,       // fromName
                $subject,
                $textBody,
                $htmlBody
            );

            if (!$emailSent) {
                $emailMessage = "sendEmail() returned false.";
            }
        } catch (Exception $e) {
            $emailMessage = "sendEmail exception: " . $e->getMessage();
        }
    } else {
        $emailMessage = "No client email found; skipping notification.";
    }

    echo json_encode([
        "success" => true,
        "message" => "Case progress updated successfully by {$lawyerName}",
        "email_sent" => $emailSent,
        "email_message" => $emailMessage
    ]);
    exit;

} catch (Exception $e) {
    // If transaction was open, roll back
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
    exit;
}
