<?php
require_once dirname(__DIR__) . '/inc/db.php';
// require_once dirname(__DIR__) . '/inc/function.php'; // sendEmail()
require_once dirname(__DIR__) . '/apis/auth/libs/logger.php'; // activity log()

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method. Only POST allowed."]);
    exit;
}
    try {
        if (!isset($_POST['user_id']) || empty($_POST['user_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
            exit;
        }

        $userId = intval($_POST['user_id']);
        $file   = $_FILES['profile_image'] ?? null;

        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid image upload"]);
            exit;
        }

        // ✅ Validate file type (JPEG, PNG only)
        $allowed = ['image/jpeg', 'image/png'];
        if (!in_array($file['type'], $allowed)) {
            http_response_code(400);
            echo json_encode(["error" => "Only JPG and PNG images are allowed"]);
            exit;
        }

        // ✅ Validate file size (max 2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["error" => "File too large (max 2MB)"]);
            exit;
        }

        // ✅ Generate unique filename
        $ext       = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newName   = "user_" . $userId . "_" . time() . "." . $ext;
        $uploadDir = __DIR__ . "/../uploads/profile_images/";
        $filePath  = $uploadDir . $newName;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to save file"]);
            exit;
        }

        // ✅ Save relative path for DB
        $dbPath = "uploads/profile_images/" . $newName;

        // ✅ Connect DB
        $pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        //get lawyer details
        $stmt = $pdo->prepare("SELECT full_name, email FROM cms_users WHERE id = ?");
        $stmt->execute([$userId]);
        $lawyer = $stmt->fetch();

        // Mark old images as inactive
        $pdo->prepare("UPDATE cms_user_profile_images SET is_current = 0 WHERE user_id = ?")
            ->execute([$userId]);

        // Insert new record
        $stmt = $pdo->prepare("
            INSERT INTO cms_user_profile_images (user_id, file_name, file_path, is_current, uploaded_at, updated_at)
            VALUES (:user_id, :file_name, :file_path, 1, NOW(), NOW())
        ");
        $stmt->execute([
            ":user_id"   => $userId,
            ":file_name" => $file['name'], // original name
            ":file_path" => $dbPath
        ]);

        log_activity($pdo, $userId, 'PROFILE_IMAGE_UPLOAD', "Profile image uploaded by {$lawyer['full_name']} ({$lawyer['email']})", 'SUCCESS', 'USER_MANAGEMENT');


        echo json_encode([
            "success" => true,
            "message" => "Profile image uploaded successfully",
            "file_path" => $dbPath
        ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
