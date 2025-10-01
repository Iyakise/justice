<?php
require_once dirname(__DIR__) . '/inc/db.php';
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

    // 🔹 Fetch lawyer name
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

    // 🔹 Append lawyer’s name to remarks
    $finalRemarks = trim($remarks . " (Updated by: Lawyer $lawyerName)");

    // 🔹 Insert into progress table
    $stmt = $pdo->prepare("
        INSERT INTO cms_case_progress (user_id, updated_by, status, remarks, created_at)
        VALUES (:case_id, :lawyer_id, :status, :remarks, NOW())
    ");
    $stmt->execute([
        ":case_id"   => $caseId,
        ":lawyer_id" => $lawyerId,
        ":status"    => $status,
        ":remarks"   => $finalRemarks
    ]);

    // 🔹 Log activity in activity_logs
    $logStmt = $pdo->prepare("
        INSERT INTO cms_activity_logs (user_id, action, description, created_at)
        VALUES (:user_id, :action, :description, NOW())
    ");
    $logStmt->execute([
        ":user_id"     => $lawyerId,
        ":case_id"     => $caseId,
        ":action"      => "case_progress_update",
        ":description" => "$lawyerName updated case #$caseId status to '$status' with remarks: $remarks"
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Case progress updated successfully by $lawyerName"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
