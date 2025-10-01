<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $lawyerId = isset($_GET['uid']) ? (int) $_GET['uid'] : 0;

    if ($lawyerId <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing or invalid parameter: uid"
        ]);
        exit;
    }

    // 🔹 All cases in the system (regardless of lawyer)
    $stmt = $pdo->query("SELECT COUNT(*) FROM cms_cases");
    $allCases = (int) $stmt->fetchColumn();

    // 🔹 Total cases assigned to this lawyer
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM cms_cases WHERE assigned_to = :lawyerId");
    $stmt->execute([":lawyerId" => $lawyerId]);
    $assignedCases = (int) $stmt->fetchColumn();

    // 🔹 Ongoing cases handled by this lawyer
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM cms_cases 
        WHERE assigned_to = :lawyerId 
          AND (status = 'In Court' OR status = 'Ongoing' OR status = 'In Progress')
    ");
    $stmt->execute([":lawyerId" => $lawyerId]);
    $ongoingCases = (int) $stmt->fetchColumn();

    // 🔹 Closed cases handled by this lawyer
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM cms_cases 
        WHERE assigned_to = :lawyerId 
          AND (status = 'Resolved' OR status = 'Closed')
    ");
    $stmt->execute([":lawyerId" => $lawyerId]);
    $closedCases = (int) $stmt->fetchColumn();

    echo json_encode([
        "success" => true,
        "data" => [
            "all_cases" => $allCases,
            "assigned_cases" => $assignedCases,
            "ongoing_cases" => $ongoingCases,
            "closed_cases" => $closedCases
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
