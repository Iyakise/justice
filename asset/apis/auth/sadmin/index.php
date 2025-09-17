<?php
require_once dirname(__DIR__, 2) . '/auth/session-bootstrap.php';
require_once dirname(__DIR__, 3) . '/inc/db.php';
require_once dirname(__DIR__, 2) . '/auth/rate-limit.php';
require_once dirname(__DIR__, 1) . '/libs/logger.php';

header('Content-Type: application/json');

// Function to log activity
// function log_activity(PDO $pdo, ?int $user_id, string $action, string $description, string $status = 'SUCCESS', string $module = 'AUTH'): void {
//     try {
//         $stmt = $pdo->prepare("
//             INSERT INTO cms_activity_logs (user_id, action, description, ip_address, user_agent, module, status, created_at)
//             VALUES (:user_id, :action, :description, :ip_address, :user_agent, :module, :status, NOW())
//         ");
//         $stmt->execute([
//             ':user_id'    => $user_id,
//             ':action'     => $action,
//             ':description'=> $description,
//             ':ip_address' => inet_pton($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'),
//             ':user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 255),
//             ':module'     => $module,
//             ':status'     => $status
//         ]);
//     } catch (Exception $e) {
//         // Silent fail to avoid breaking login flow
//     }
// }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status'  => false,
        'message' => 'Method Not Allowed'
    ]);
    exit;
}

try {
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode([
        'status'  => false,
        'message' => 'Database connection failed.'
    ]);
    exit;
}

try {
    $data = json_decode(file_get_contents("php://input"), true);

    $email = trim($data['email'] ?? '');
    $pass  = (string)($data['password'] ?? '');

    if (too_many_attempts($pdo, $email)) {
        log_activity($pdo, null, 'LOGIN_ATTEMPT', "Rate limit exceeded for email: $email", 'FAILED');
        http_response_code(429);
        echo json_encode(['status' => false, 'message' => 'Too many attempts. Try again later.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        record_attempt($pdo, $email, false);
        log_activity($pdo, null, 'LOGIN_ATTEMPT', "Invalid email format attempted: $email", 'FAILED');
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'Invalid credentials.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, name, email, password, role, status FROM super_admins WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] !== 'active') {
        record_attempt($pdo, $email, false);
        log_activity($pdo, null, 'LOGIN_ATTEMPT', "Login failed (inactive or not found) for email: $email", 'FAILED');
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'Invalid credentials.']);
        exit;
    }

    if (!password_verify($pass, $user['password'])) {
        record_attempt($pdo, $email, false);
        log_activity($pdo, (int)$user['id'], 'LOGIN_ATTEMPT', "Invalid password for super_admin id {$user['id']}", 'FAILED');
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'Invalid credentials.']);
        exit;
    }

    // Success
    record_attempt($pdo, $email, true);
    session_regenerate_id(true);

    $_SESSION['sauth'] = [
        'id'    => (int)$user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
        'time'  => time()
    ];

    $upd = $pdo->prepare("UPDATE super_admins SET last_login = NOW() WHERE id = :id");
    $upd->execute([':id' => $user['id']]);

    clear_attempts($pdo, $email);

    log_activity($pdo, (int)$user['id'], 'LOGIN_SUCCESS', "Super Admin {$user['name']} (ID {$user['id']}) logged in successfully", 'SUCCESS', 'AUTH');

    echo json_encode([
        'status'   => true,
        'message'  => 'Login successful',
        'redirect' => 'staff-ms/'
    ]);
    exit;

} catch (Exception $e) {
    log_activity($pdo, null, 'LOGIN_ERROR', "Login process error: " . $e->getMessage(), 'FAILED');
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}
