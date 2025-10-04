<?php
require_once dirname(__DIR__) . '/inc/db.php';
require_once dirname(__DIR__) . '/inc/function.php'; // sendEmail()
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php'; // activity log()

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only POST allowed."]);
    exit;
}
    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['case_id']) || empty($data['case_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Case ID is required"]);
            exit;
        }

        $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        $caseId = intval($data['case_id']);
        $userId = $data['lawyer_id'] ?? null;   // the person closing the case
        $role   = $data['role'] ?? 'lawyer';    // default role

        // ✅ Check if case exists
        $stmt = $pdo->prepare("SELECT filed_by, status FROM cms_cases WHERE id = ?");
        $stmt->execute([$caseId]);
        $case = $stmt->fetch();

        if (!$case) {
            http_response_code(404);
            echo json_encode(["error" => "Case not found"]);
            exit;
        }

        if ($case['status'] === 'closed') {
            echo json_encode(["message" => "Case already closed"]);
            exit;
        }

        // ✅ Handle role & remarks
        $remark = null;
        if ($role === 'admin') {
            if (!isset($data['remark']) || empty(trim($data['remark']))) {
                http_response_code(400);
                echo json_encode(["error" => "Remark is required when admin closes a case"]);
                exit;
            }
            $remark = trim($data['remark']);
        } elseif ($role !== 'lawyer') {
            http_response_code(403);
            echo json_encode(["error" => "Unauthorized. Only lawyers or admins can close cases"]);
            exit;
        }

        // ✅ Update case
        $update = $pdo->prepare("
            UPDATE cms_cases 
            SET status = 'closed', resolution_date = NOW(), updated_at = NOW() 
            WHERE id = ?
        ");
        $update->execute([$caseId]);
        $finalremark = $remark ? $remark : "This case was closed by lawyer ID #$userId";
        // ✅ Insert into case progress
        $progress = $pdo->prepare("INSERT INTO cms_case_progress (case_id, updated_by ,status, remarks, created_at) VALUES (?, ?, ?, ?, NOW())");
        $progress->execute([$caseId, $userId, 'Closed', $finalremark]);

        // ✅ Log activity
        // $logAction = ($role === 'admin') ? "Case closed by admin (Remark: $remark)" : "Case closed by lawyer";
        // $log = $pdo->prepare("INSERT INTO cms_activity_logs (user_id, action, description, created_at) VALUES (?, ?, ?, NOW())");
        // $log->execute([$userId, $logAction, $remark]);

        log_activity($pdo, $userId, 'CASE_CLOSED', "Case ID #$caseId closed by $role" . ($remark ? " with remark: $remark" : ""), 'SUCCESS', 'CASE_MANAGEMENT');    

        // ✅ Notify client (use filed_by → cms_users)
        $clientStmt = $pdo->prepare("SELECT email, full_name FROM cms_users WHERE id = ?");
        $clientStmt->execute([$case['filed_by']]);
        $client = $clientStmt->fetch();

        if ($client) {
            $subject = "Your Case #$caseId Has Been Closed";
            $message = "Hello " . $client['full_name'] . ",<br><br>Your case with ID <b>$caseId</b> has been successfully closed.<br>";

            if ($role === 'admin') {
                $message .= "<br><b>Admin Remark:</b> $remark<br>";
            }

            $message .= "<br>Best regards,<br>Case Management System";

            sendEmail($client['email'], $client['full_name'], __SITE_NAME__,  $subject, $message, $message);
//             function sendEmail(
    
//     string $toEmail,
//     string $toName,
//     // string $fromEmail,
//     string $fromName,
//     string $subject,
//     string $textBody,
//     string $htmlBody
// )
        }

        echo json_encode(["success" => true, "message" => "Case closed successfully"]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Server error: " . $e->getMessage()]);
    }

