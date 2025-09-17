<?php
// lib/logger.php

if (!function_exists('log_activity')) {
    /**
     * Logs activity into the activity_logs table
     *
     * @param PDO         $pdo
     * @param int|null    $user_id   User ID (nullable if unknown)
     * @param string      $action    Action keyword (e.g., LOGIN_SUCCESS, ADD_STAFF)
     * @param string      $description Detailed description of the action
     * @param string      $status    SUCCESS or FAILED
     * @param string      $module    Optional module/category (default: SYSTEM)
     */
    function log_activity(PDO $pdo, ?int $user_id, string $action, string $description, string $status = 'SUCCESS', string $module = 'SYSTEM'): void
    {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO cms_activity_logs (user_id, action, description, ip_address, user_agent, module, status, created_at)
                VALUES (:user_id, :action, :description, :ip_address, :user_agent, :module, :status, NOW())
            ");

            $stmt->execute([
                ':user_id'    => $user_id,
                ':action'     => strtoupper($action),
                ':description'=> $description,
                ':ip_address' => inet_pton($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'),
                ':user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 255),
                ':module'     => strtoupper($module),
                ':status'     => strtoupper($status)
            ]);
        } catch (Exception $e) {
            // Do nothing — logging should never break the main process
            //log it inside logs/activity_logs.log
            
        }
    }
}
