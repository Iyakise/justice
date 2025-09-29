<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $lawyerId = $_GET['lawyer_id'] ?? null; // optional filter

    // total cases
    $totalCases = $pdo->query("SELECT COUNT(*) AS total FROM cms_cases")->fetch()['total'];

    // cases assigned to a lawyer (if lawyer_id provided)
    $casesAssigned = 0;
    if ($lawyerId) {
        $stmt = $pdo->prepare("SELECT COUNT(*) AS total FROM cms_cases WHERE assigned_to = :lawyerId");
        $stmt->execute([":lawyerId" => $lawyerId]);
        $casesAssigned = $stmt->fetch()['total'];
    }

    // ongoing hearings
    $ongoingCases = $pdo->query("SELECT COUNT(*) AS total FROM cms_cases WHERE status = 'In Court' OR status = 'Ongoing'")->fetch()['total'];

    // closed cases
    $closedCases = $pdo->query("SELECT COUNT(*) AS total FROM cms_cases WHERE status = 'Resolved' OR status = 'Closed'")->fetch()['total'];

    echo json_encode([
        "success" => true,
        "data" => [
            "total_cases" => (int)$totalCases,
            "cases_assigned_to_lawyer" => (int)$casesAssigned,
            "ongoing_cases" => (int)$ongoingCases,
            "closed_cases" => (int)$closedCases
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
