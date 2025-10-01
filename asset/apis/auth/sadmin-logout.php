<?php 
require_once dirname(__DIR__, 2) . '/inc/db.php';
require_once dirname(__DIR__, 2) . '/inc/function.php';
require_once 'session-bootstrap.php';
require_once __DIR__ . '/libs/logger.php';

try {
    // Create DB connection
    $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    $pdo = null; // If DB fails, still allow logout
}

// ✅ Capture session user *before* destroying session
$adminId   = $_SESSION['sauth']['id']    ?? null;
$adminName = $_SESSION['sauth']['name']  ?? 'Unknown';
$adminMail = $_SESSION['sauth']['email'] ?? 'Unknown';

// Clear session
$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Destroy session completely
session_destroy();

// ✅ Log logout event only if session had a valid admin
if ($pdo && $adminId) {
    log_activity(
        $pdo,
        $adminId,
        'LOGOUT',
        "Super admin {$adminName} ({$adminMail}) logged out.",
        'SUCCESS',
        'AUTH'
    );
}
session_logout();



// Redirect to login
$root = __ROOT__();
header("Location: {$root}staff-ms/login.html");
exit;
