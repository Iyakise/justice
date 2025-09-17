<?php
require_once  'session-bootstrap.php';

// Check session
if (empty($_SESSION['sauth']) || empty($_SESSION['sauth']['id'])) {
  //   header('Location: login.html'); // adjust
    http_response_code(401);
  echo json_encode([
    'error' => 'Unauthorized',
    'message' => 'You must be logged in to access this resource.',
    'type' => 'authentication'
  ]);
  exit;
}

// OPTIONAL: enforce role
if (!in_array($_SESSION['sauth']['role'], ['super_admin', 'admin'], true)) {
  http_response_code(403);
  echo json_encode([
    'error' => 'Forbidden',
    'message' => 'You do not have permission to access this resource.',
    'type' => 'authorization'
  ]);
  exit('Forbidden');
}

// OPTIONAL: idle timeout (e.g., 30 minutes)
$maxIdle = 30 * 60;
if (time() - ($_SESSION['sauth']['time'] ?? 0) > $maxIdle) {
  session_unset();
  session_destroy();
    http_response_code(401);
  echo json_encode([
    'error' => 'Unauthorized',
    'message' => 'You must be logged in to access this resource.',
    'type' => 'authentication'
  ]);
  exit;
}
// Refresh activity time
// $_SESSION['sauth']['time'] = time();
