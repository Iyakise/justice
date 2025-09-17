<?php
// Rate limiting functions for login attempts

function ip_to_bin(string $ip): string {
  $packed = @inet_pton($ip);
  return $packed !== false ? $packed : str_repeat("\0", 16);
}

function record_attempt(PDO $pdo, string $email, bool $success): void {
  $stmt = $pdo->prepare("INSERT INTO login_attempts (email, ip, attempt_time, success)
                         VALUES (:email, :ip, NOW(), :success)");
  $stmt->execute([
    ':email'   => $email,
    ':ip'      => ip_to_bin($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'),
    ':success' => $success ? 1 : 0
  ]);
}

function too_many_attempts(PDO $pdo, string $email, int $max = 5, int $windowMinutes = 15): bool {
  $stmt = $pdo->prepare("SELECT COUNT(*) AS c
                         FROM login_attempts
                         WHERE email = :email
                           AND attempt_time >= (NOW() - INTERVAL :win MINUTE)
                           AND success = 0");
  $stmt->bindValue(':email', $email);
  $stmt->bindValue(':win', $windowMinutes, PDO::PARAM_INT);
  $stmt->execute();
  $count = (int)$stmt->fetchColumn();
  return $count >= $max;
}

function clear_attempts(PDO $pdo, string $email): void {
  $stmt = $pdo->prepare("DELETE FROM login_attempts WHERE email = :email");
  $stmt->execute([':email' => $email]);
}
