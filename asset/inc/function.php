<?php


function __ROOT__(){

    // Detect protocol (HTTP or HTTPS)
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://";
    
    // Get the host (domain name or localhost)
    $host = $_SERVER['HTTP_HOST']; // Example: localhost or xpert-brigde.com
    
    // Get the project folder (only needed if working locally)
    $projectFolder = "/moj"; // Change this based on your local setup
    
    // Check if running on localhost or a live server
    if ($host === "localhost") {
        $baseURL = $protocol . $host . $projectFolder . "/";
    } else {
        $baseURL = $protocol . $host . "/";
    }
    
    // Output the base URL
    //  define('BASE_URL', $baseURL);
    return $baseURL;
    // Example Usage
    // echo BASE_URL; // This will print the correct URL based on the environment


}

define('__SITE_NAME__', 'Akwa Ibom State Ministry of Justice (AKS-MOJ)');



/**
 * Send an email via SendGrid.
 *
 * @param string $toEmail   Recipient email address
 * @param string $toName    Recipient name
 * @param string $fromEmail Sender email address
 * @param string $fromName  Sender name
 * @param string $subject   Email subject
 * @param string $textBody  Plain-text body
 * @param string $htmlBody  HTML body
 * @return bool             True on success, false on failure
 */
if (!function_exists('sendEmail')) {
function sendEmail(
    
    string $toEmail,
    string $toName,
    // string $fromEmail,
    string $fromName,
    string $subject,
    string $textBody,
    string $htmlBody
): bool {
    //require_once  'api-key.php';
    // $apiKey = SENDGRID_API;
    if(!defined('XPERT_TO_USER')){
        define('XPERT_TO_USER', $toEmail);
    }

    if(!defined('XPERT_TO_USERNAME')){
        define('XPERT_TO_USERNAME', $toName);
    }

    if(!defined('XPERT_FROM_NAME')){
        define('XPERT_FROM_NAME', $fromName);
    }

    if(!defined('XPERT_EMAIL_SUBJECT')){
        define('XPERT_EMAIL_SUBJECT', $subject);
    }

    if(!defined('XPERT_MAIL_CONTENT_PLAN')){
        define('XPERT_MAIL_CONTENT_PLAN', $textBody);
    }

    if(!defined('XPERT_MAIL_CONTENT_HTML')){
        define('XPERT_MAIL_CONTENT_HTML', $htmlBody);
    }

    if(!defined('__SHOW_SUCCESS__')){
        define('__SHOW_SUCCESS__', false);
    }

    // define('SENDGRID_API', SENDGRID_API);
    // define('__SHOW_SUCCESS__', false);

    //
    //log tutors email data to logs/email-tutors.log
        $logData = [
            'to' => XPERT_TO_USER,
            'subject' => XPERT_EMAIL_SUBJECT,
            'message' => XPERT_MAIL_CONTENT_HTML,
            'date' => date("Y-m-d H:i:s")
        ];
        file_put_contents(dirname(__DIR__) . "/apis/logs/email-staff.log", json_encode($logData) . PHP_EOL, FILE_APPEND);


    require_once 'send-email.php';

    return true; // Return true if email is sent successfully
    // return false; // Return false if there was an error
    // Note: The actual email sending logic is handled in the included send-email.php file.
    // You can customize the return value based on the success of the email sending operation.
    // return $result; // Return the result of the email sending operation
    // return $result; // Return the result of the email sending operation
}

}