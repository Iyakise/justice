<?php
// api_helpers.php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

/**
 * Standardized JSON response
 */
function apiResponse($status, $message, $data = null) {
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ], JSON_PRETTY_PRINT);
    exit;
}

/**
 * Secure PDO connection
 */
function getPDO() {
    require dirname(__DIR__) . '/inc/db.php';  // DB_DSN, DB_USERNAME, DB_PASSWORD

    try {
        return new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $e) {
        error_log("DB Connection Error: " . $e->getMessage());
        apiResponse("error", "Failed to connect to database");
    }
}
