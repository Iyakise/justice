<?php
require_once dirname(__DIR__) . '/inc/db.php';
require_once dirname(__DIR__) . '/inc/function.php'; 
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php';
require_once dirname(__DIR__) . '/apis/auth/session-bootstrap.php';

header("Content-Type: application/json");

// Allow PUT or POST
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'PUT' && $method !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Only PUT or POST requests allowed."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Invalid JSON input."]);
        exit;
    }

    $case_id       = $input['id'] ?? null;
    $title         = $input['title'] ?? null;
    $description   = $input['description'] ?? null;
    $case_type     = $input['case_type'] ?? null;
    $status        = $input['status'] ?? null;
    $priority      = $input['priority'] ?? null;
    $filed_by      = $input['filed_by'] ?? null;
    $assigned_to   = $input['assigned_to'] ?? null;
    $court_date    = $input['court_date'] ?? null;
    $resolution    = $input['resolution_date'] ?? null;

    if (!$case_id || !is_numeric($case_id)) {
        http_response_code(422);
        echo json_encode(["status" => false, "message" => "Valid case_id is required."]);
        exit;
    }

    // Fetch old case
    $stmt = $pdo->prepare("SELECT * FROM cms_cases WHERE id = :id LIMIT 1");
    $stmt->execute([":id" => $case_id]);
    $oldCase = $stmt->fetch();

    if (!$oldCase) {
        http_response_code(404);
        echo json_encode(["status" => false, "message" => "Case not found."]);
        exit;
    }

    // Build dynamic update query
    $fields = [];
    $params = [":id" => $case_id];
    if ($title !== null) { $fields[] = "title = :title"; $params[":title"] = $title; }
    if ($description !== null) { $fields[] = "description = :description"; $params[":description"] = $description; }
    if ($case_type !== null) { $fields[] = "case_type = :case_type"; $params[":case_type"] = $case_type; }
    if ($status !== null) { $fields[] = "status = :status"; $params[":status"] = $status; }
    // if ($priority !== null) { $fields[] = "priority = :priority"; $params[":priority"] = $priority; }
    if ($filed_by !== null) { $fields[] = "filed_by = :filed_by"; $params[":filed_by"] = $filed_by; }
    if ($assigned_to !== null) { $fields[] = "assigned_to = :assigned_to"; $params[":assigned_to"] = $assigned_to; }
    if ($court_date !== null) { $fields[] = "court_date = :court_date"; $params[":court_date"] = $court_date; }
    if ($resolution !== null) { $fields[] = "resolution_date = :resolution_date"; $params[":resolution_date"] = $resolution; }

    if (empty($fields)) {
        echo json_encode(["status" => false, "message" => "No fields to update."]);
        exit;
    }

    $sql = "UPDATE cms_cases SET " . implode(", ", $fields) . ", updated_at = NOW() WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // ============= Notifications & Logs ============
    $actor_id   = $_SESSION['sauth']['id'] ?? null;
    $actor_role = $_SESSION['sauth']['role'] ?? 'system';

    $refdata = $title ?? $oldCase['title'];

    // Lawyer changed?
    if ($assigned_to !== null && $assigned_to != $oldCase['assigned_to']) {
        $stmt = $pdo->prepare("SELECT email, full_name FROM cms_user WHERE id = :id LIMIT 1");
        $stmt->execute([":id" => $assigned_to]);
        if ($newLawyer = $stmt->fetch()) {
            $subject = "New Case Assigned to You";
            $body = <<<HTML
                    <p>Hello <strong>{$newLawyer['full_name']}</strong>,</p>
                    <p>You have been assigned case <strong>{$oldCase['case_number']}</strong> titled 
                    "<em>
                        {$refdata}
                    </em>"
                    .</p>
                    <p>Please log in to the Case Management System for details.</p>
                    HTML;
                    
            // sendMail($newLawyer['email'], $newLawyer['full_name'], $subject, $body);
        }

        // Log it
        log_activity($pdo, $actor_id, "case_update", 
            "Changed lawyer for case {$oldCase['case_number']} from ID {$oldCase['assigned_to']} to ID {$assigned_to}", 
            "cases");
    }

    // Filed_by changed?
    if ($filed_by !== null && $filed_by != $oldCase['filed_by']) {
        $stmt = $pdo->prepare("SELECT email, full_name FROM cms_user WHERE id = :id LIMIT 1");
        $stmt->execute([":id" => $filed_by]);
        if ($newFiler = $stmt->fetch()) {
            $subject = "Case Filing Updated";
            $body = <<<HTML
                <p>Hello <strong>{$newFiler['full_name']}</strong>,</p>
                <p>You are now registered as the filer of case <strong>{$oldCase['case_number']}</strong>.</p>
                <p>Log in to the system to review details.</p>
            HTML;
            sendMail($newFiler['email'], $newFiler['full_name'], $subject, $body);
        }

        // Log it 
        log_activity($pdo, $actor_id, "case_update", 
            "Changed filer for case {$oldCase['case_number']} from ID {$oldCase['filed_by']} to ID {$filed_by}", 
            "cases");
    }

    // General update log
    log_activity($pdo, $actor_id, "case_update", 
        "Updated case {$oldCase['case_number']}", 
        "cases");

    echo json_encode([
        "status" => true,
        "message" => "Case updated successfully",
        "updated_id" => $case_id
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Unexpected error: " . $e->getMessage()]);
}

/**
 * Logs activity into cms_activity_logs
 */
// function log_activity($pdo, $user_id, $action, $description, $module) {
//     $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
//     $agent = $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN';
//     $stmt = $pdo->prepare("
//         INSERT INTO cms_activity_logs (user_id, action, description, ip_address, module, user_agent, created_at)
//         VALUES (:user_id, :action, :description, :ip, :module, :agent, NOW())
//     ");
//     $stmt->execute([
//         ":user_id" => $user_id,
//         ":action" => $action,
//         ":description" => $description,
//         ":ip" => $ip,
//         ":module" => $module,
//         ":agent" => $agent
//     ]);
// }
