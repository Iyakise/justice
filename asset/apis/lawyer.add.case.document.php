<?php
require_once dirname(__DIR__) . '/inc/db.php';
require_once dirname(__DIR__) . '/inc/function.php'; // your sendEmail() helper

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method. Only POST allowed.");
    }

    $case_id     = intval($_POST['case_id'] ?? 0);
    $uploaded_by = intval($_POST['uploaded_by'] ?? 0); // lawyer/admin id
    $doc_type    = isset($_POST['doc_type']) ? trim($_POST['doc_type']) : null;
    $remarks     = isset($_POST['remarks']) ? trim($_POST['remarks']) : null;
    $file        = $_FILES['document'] ?? null;

    if (!$case_id || !$uploaded_by) {
        throw new Exception("Missing required fields: case_id or uploaded_by");
    }

    if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Invalid file upload");
    }

    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Generate unique filename
    $file_ext   = pathinfo($file['name'], PATHINFO_EXTENSION);
    $file_name  = time() . "_" . uniqid() . "." . $file_ext;
    $upload_dir = __DIR__ . "/../uploads/case_docs/";
    $file_path  = $upload_dir . $file_name;

    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0777, true)) {
        throw new Exception("Failed to create upload directory");
    }

    if (!move_uploaded_file($file['tmp_name'], $file_path)) {
        throw new Exception("File move failed");
    }

    // Relative path for DB
    $db_file_path = "uploads/case_docs/" . $file_name;

    // Get latest version
    $stmt = $pdo->prepare("SELECT MAX(version) AS last_version FROM cms_case_documents WHERE case_id = ?");
    $stmt->execute([$case_id]);
    $row = $stmt->fetch();
    $new_version = $row['last_version'] ? $row['last_version'] + 1 : 1;

    // Insert new record
    $stmt = $pdo->prepare("
        INSERT INTO cms_case_documents
        (case_id, file_name, file_path, doc_type, remarks, version, uploaded_by, uploaded_at, updated_at, is_active)
        VALUES
        (:case_id, :file_name, :file_path, :doc_type, :remarks, :version, :uploaded_by, NOW(), NOW(), 1)
    ");
    $stmt->execute([
        ":case_id"     => $case_id,
        ":file_name"   => $file['name'],   // original filename
        ":file_path"   => $db_file_path,   // relative path
        ":doc_type"    => $doc_type,
        ":remarks"     => $remarks,
        ":version"     => $new_version,
        ":uploaded_by" => $uploaded_by
    ]);

    // 🔹 Log activity
    $logStmt = $pdo->prepare("
        INSERT INTO cms_activity_logs (user_id, action, description, created_at)
        VALUES (:user_id, :action, :description, NOW())
    ");
    $logStmt->execute([
        ":user_id"     => $uploaded_by,
        ":action"      => "case_document_upload",
        ":description" => "Uploaded document '{$file['name']}' (type: {$doc_type}, version: {$new_version}) with remarks: {$remarks}"
    ]);

    // 🔹 Optional email
    if (isset($_POST['notify_client']) && $_POST['notify_client'] == "1") {
        $stmt = $pdo->prepare("
            SELECT c.email, c.name, cs.case_title
            FROM cms_cases cs
            JOIN cms_clients c ON cs.client_id = c.id
            WHERE cs.id = ?
        ");
        $stmt->execute([$case_id]);
        $client = $stmt->fetch();

        if ($client) {
            $toEmail   = $client['email'];
            $toName    = $client['name'];
            $fromName  = "Legal Team";
            $subject   = "New Document Uploaded for Your Case: " . $client['case_title'];

            $textBody  = "Dear {$client['name']},\n\n"
                       . "A new document has been uploaded to your case: {$client['case_title']}.\n"
                       . "Document Type: {$doc_type}\n"
                       . "Remarks: {$remarks}\n\n"
                       . "Regards,\nLegal Team";

            $htmlBody  = "<p>Dear {$client['name']},</p>
                          <p>A new document has been uploaded to your case: <strong>{$client['case_title']}</strong>.</p>
                          <ul>
                            <li><strong>Document Type:</strong> {$doc_type}</li>
                            <li><strong>Remarks:</strong> {$remarks}</li>
                          </ul>
                          <p>Regards,<br>Legal Team</p>";

            sendEmail($toEmail, $toName, $fromName, $subject, $textBody, $htmlBody);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Document uploaded successfully",
        "version" => $new_version
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => $e->getMessage()
    ]);
}
