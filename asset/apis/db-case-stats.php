<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get year (default = current year)
    $year = isset($_GET['year']) ? intval($_GET['year']) : date("Y");

    // Query: count per month
    $stmt = $pdo->prepare("
        SELECT 
            MONTH(created_at) AS month,
            COUNT(*) AS total
        FROM cms_cases
        WHERE YEAR(created_at) = :year
        GROUP BY MONTH(created_at)
        ORDER BY MONTH(created_at)
    ");
    $stmt->execute(['year' => $year]);
    $rows = $stmt->fetchAll();

    // Month names map
    $monthNames = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar',
        4 => 'Apr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Aug', 9 => 'Sep',
        10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
    ];

    // Initialize all months with 0
    $months = [];
    foreach ($monthNames as $num => $name) {
        $months[$name] = 0;
    }

    foreach ($rows as $row) {
        $months[$monthNames[(int)$row['month']]] = (int)$row['total'];
    }

    echo json_encode([
        'year' => $year,
        'data' => $months
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
