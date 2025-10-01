<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $caseId = isset($_GET['cid']) ? (int) $_GET['cid'] : 0;

    if ($caseId <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing or invalid parameter: cid"
        ]);
        exit;
    }

    // 🔹 Fetch case details with client + assigned lawyer names
    $stmt = $pdo->prepare("
        SELECT 
            c.*,
            u.full_name AS client_name,
            l.full_name AS lawyer_name
        FROM cms_cases c
        LEFT JOIN cms_users u ON c.filed_by = u.id
        LEFT JOIN cms_users l ON c.assigned_to = l.id
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

    // 🔹 Fetch case documents
    $stmt = $pdo->prepare("
        SELECT 
            d.id,
            d.file_name,
            d.file_path,
            d.uploaded_by,
            u.full_name AS uploaded_by_name,
            d.uploaded_at
        FROM cms_case_documents d
        LEFT JOIN cms_users u ON d.uploaded_by = u.id
        WHERE d.case_id = :caseId
        ORDER BY d.uploaded_at DESC
    ");
    $stmt->execute([":caseId" => $caseId]);
    $documents = $stmt->fetchAll();

    // 🔹 Fetch case timeline from progress table
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.status,
            p.remarks,
            p.created_at,
            u.full_name AS updated_by_name
        FROM cms_case_progress p
        LEFT JOIN cms_users u ON p.updated_by = u.id
        WHERE p.case_id = :caseId
        ORDER BY p.created_at ASC
    ");
    $stmt->execute([":caseId" => $caseId]);
    $timeline = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "case" => $case,
        "documents" => $documents,
        "timeline" => $timeline
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
