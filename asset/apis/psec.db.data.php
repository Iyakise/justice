<?php
require_once dirname(__DIR__) . '/inc/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only GET allowed."]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ✅ Count total cases
    $totalCases = $pdo->query("SELECT COUNT(*) FROM cms_cases")->fetchColumn();

    // ✅ Count ongoing cases
    $ongoingCases = $pdo->query("SELECT COUNT(*) FROM cms_cases WHERE status = 'Ongoing' || status = 'in progress'")->fetchColumn();

    // ✅ Count closed cases
    $closedCases = $pdo->query("SELECT COUNT(*) FROM cms_cases WHERE status = 'Closed'")->fetchColumn();

    // ✅ Count pending reviews
    $pendingReviews = $pdo->query("SELECT COUNT(*) FROM cms_cases WHERE status = 'On Hold'")->fetchColumn();

    echo json_encode([
        "success" => true,
        "data" => [
            "total_cases" => (int)$totalCases,
            "ongoing_cases" => (int)$ongoingCases,
            "closed_cases" => (int)$closedCases,
            "pending_reviews" => (int)$pendingReviews
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
