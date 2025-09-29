<?php
header("Content-Type: application/json");
session_start();

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "logged_in" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'],
            "role" => $_SESSION['role']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        "logged_in" => false,
        "message" => "User not logged in"
    ]);
}
