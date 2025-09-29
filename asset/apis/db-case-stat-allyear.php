<?php
require_once dirname(__DIR__) . '/inc/db.php';
header("Content-Type: application/json");

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Query: counts grouped by year + month
    $stmt = $pdo->query("
        SELECT 
            YEAR(created_at) AS year,
            MONTH(created_at) AS month,
            COUNT(*) AS total
        FROM cms_cases
        GROUP BY YEAR(created_at), MONTH(created_at)
        ORDER BY YEAR(created_at), MONTH(created_at)
    ");
    $rows = $stmt->fetchAll();

    // Month names map
    $monthNames = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar',
        4 => 'Apr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Aug', 9 => 'Sep',
        10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
    ];

    $data = [];
    $grandTotal = 0;

    foreach ($rows as $row) {
        $year = (int)$row['year'];
        $monthNum = (int)$row['month'];
        $total = (int)$row['total'];

        // Initialize structure for each year
        if (!isset($data[$year])) {
            $data[$year] = [
                'total' => 0,
                'data' => []
            ];
            foreach ($monthNames as $m) {
                $data[$year]['data'][$m] = 0;
            }
        }

        $data[$year]['data'][$monthNames[$monthNum]] = $total;
        $data[$year]['total'] += $total;
        $grandTotal += $total;
    }

    // Add grand total
    $response = [
        'grand_total' => $grandTotal,
        'years' => $data
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
