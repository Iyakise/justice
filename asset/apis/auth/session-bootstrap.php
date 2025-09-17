<?php
// session_bootstrap.php
// Secure session bootstrap + helpers for your super-admin panel.
// Place this in config/ and include it at top of pages that need sessions.

// --------- CONFIG (tweak as needed) ----------------
if (!defined('SESSION_NAME'))      define('SESSION_NAME', 'SAUTH');
if (!defined('SESSION_IDLE'))      define('SESSION_IDLE', 30 * 60);      // seconds of inactivity (30 minutes)
if (!defined('SESSION_ABSOLUTE'))  define('SESSION_ABSOLUTE', 8 * 3600); // absolute lifetime (8 hours)
// Default redirect for require_login(); override when calling.
if (!defined('LOGIN_REDIRECT'))    define('LOGIN_REDIRECT', '/moj/staff-ms/admin/login.php');
// --------------------------------------------------

// Detect "secure" (supports reverse proxies that set forwarded proto)
$isSecure = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
    || (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower($_SERVER['HTTP_X_FORWARDED_SSL']) === 'on')
);

// Cookie params
$cookieParams = [
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',          // default current host; set to your domain if needed (e.g. '.example.com')
    'secure'   => $isSecure,
    'httponly' => true,
    'samesite' => 'Strict'     // 'Lax' if you need cross-site POSTs (e.g. OAuth callbacks)
];

// Harden session-related INI settings
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', $isSecure ? '1' : '0');

// Name and cookie params must be set before session_start()
session_name(SESSION_NAME);
session_set_cookie_params($cookieParams);

// Start session if none
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ----------------- Internal helpers -----------------

/**
 * Make a light fingerprint based on user-agent + masked IP to reduce session theft.
 * This is intentionally tolerant (masking last octet) so normal IP changes do not kill session.
 */
function _session_fingerprint(): string {
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    // For IPv4 mask last octet; for IPv6 use full (or a prefix if you prefer)
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $parts = explode('.', $ip);
        if (count($parts) === 4) {
            $ip = $parts[0] . '.' . $parts[1] . '.' . $parts[2] . '.0';
        }
    }
    return hash('sha256', $ua . '|' . $ip);
}

/**
 * Destroy current session safely (and clear cookie).
 */
function session_logout(string $redirect = ''): void {
    // clear session array
    $_SESSION = [];

    // remove session cookie
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'], $params['secure'], $params['httponly']
        );
    }

    // finally destroy
    session_destroy();

    if (!empty($redirect)) {
        header('Location: ' . $redirect);
        exit;
    }
}

/**
 * Regenerate session id and update creation time.
 * Call this after successful login.
 */
function session_regenerate_secure(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) return;
    session_regenerate_id(true);
    $_SESSION['__created'] = time();
    $_SESSION['__last_activity'] = time();
    $_SESSION['__fingerprint'] = _session_fingerprint();
}

/**
 * Check session lifetime & fingerprint; if invalid, destroy session.
 * This runs on bootstrap so you get automatic idle/absolute timeout enforcement.
 */
function _session_enforce_policy(): void {
    // set initial markers if not present
    if (!isset($_SESSION['__created'])) {
        $_SESSION['__created'] = time();
    }
    if (!isset($_SESSION['__last_activity'])) {
        $_SESSION['__last_activity'] = time();
    }
    if (!isset($_SESSION['__fingerprint'])) {
        $_SESSION['__fingerprint'] = _session_fingerprint();
    }

    $now = time();

    // Absolute timeout
    if (defined('SESSION_ABSOLUTE') && SESSION_ABSOLUTE > 0) {
        if (($now - (int)$_SESSION['__created']) > (int)SESSION_ABSOLUTE) {
            // absolute lifetime exceeded
            session_logout();
        }
    }

    // Idle timeout
    if (defined('SESSION_IDLE') && SESSION_IDLE > 0) {
        if (($now - (int)$_SESSION['__last_activity']) > (int)SESSION_IDLE) {
            // idle too long
            session_logout();
        } else {
            // update last activity timestamp
            $_SESSION['__last_activity'] = $now;
        }
    }

    // Fingerprint check (if mismatch -> possible hijack)
    if (!hash_equals($_SESSION['__fingerprint'], _session_fingerprint())) {
        // suspicious -> destroy session
        session_logout();
    }
}

// Run policy enforcement now (on include)
_session_enforce_policy();

// ----------------- Public helpers -----------------

/**
 * is_logged_in
 * Returns true if a user is authenticated (expects your app to store session payload in $_SESSION['sauth'])
 */
function is_logged_in(): bool {
    return !empty($_SESSION['sauth']) && !empty($_SESSION['sauth']['id']);
}

/**
 * require_login
 * Redirects to login page if not logged in.
 * $redirect parameter defaults to LOGIN_REDIRECT constant.
 */
function require_login(string $redirect = LOGIN_REDIRECT): void {
    if (!is_logged_in()) {
        header('Location: ' . $redirect);
        exit;
    }
}

/**
 * require_role
 * Ensures the logged-in user has one of the allowed roles.
 * $allowed may be string or array.
 */
function require_role($allowed, string $redirect = LOGIN_REDIRECT): void {
    if (!is_logged_in()) {
        header('Location: ' . $redirect);
        exit;
    }
    $roles = (array)$allowed;
    $userRole = $_SESSION['sauth']['role'] ?? null;
    if (!in_array($userRole, $roles, true)) {
        http_response_code(403);
        exit('Forbidden');
    }
}

/**
 * 
 * Returns session user payload or null.
 */
// function get_current_user(): ?array {
//     return $_SESSION['sauth'] ?? null;
// }
