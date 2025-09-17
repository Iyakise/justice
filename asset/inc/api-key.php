<?php

// SMTP Config (example: Gmail SMTP)
// SMTP Config (example: Gmail SMTP)
if (!defined('SMTP_HOST')) {
    define('SMTP_HOST', 'smtp.gmail.com');
}

if (!defined('SMTP_USERNAME')) {
    define('SMTP_USERNAME', 'yakiseetim24@gmail.com');
}

if (!defined('SMTP_PASSWORD')) {
    define('SMTP_PASSWORD', 'ofmicgscfvdkwwwn'); // Use Gmail App Password, not normal password
}

if (!defined('SMTP_PORT')) {
    define('SMTP_PORT', 587);
}

// Sender Email
if (!defined('SENDER_EMAIL_ADDRESS')) {
    define('SENDER_EMAIL_ADDRESS', 'yakiseetim24@gmail.com');
}

// Example Email placeholders
// if (!defined('XPERT_TO_USER')) {
//     define('XPERT_TO_USER', 'yakiseraphael@gmail.com');
// }

// if (!defined('XPERT_TO_USERNAME')) {
//     define('XPERT_TO_USERNAME', 'Student Name');
// }

// if (!defined('XPERT_FROM_NAME')) {
//     define('XPERT_FROM_NAME', 'XpertsBridge');
// }

// if (!defined('XPERT_EMAIL_SUBJECT')) {
//     define('XPERT_EMAIL_SUBJECT', 'Welcome to XpertsBridge');
// }

// if (!defined('XPERT_MAIL_CONTENT_PLAN')) {
//     define('XPERT_MAIL_CONTENT_PLAN', 'Plain text message.');
// }

// if (!defined('XPERT_MAIL_CONTENT_HTML')) {
//     define('XPERT_MAIL_CONTENT_HTML', '<h1>Welcome to XpertsBridge</h1><p>Your purchase was successful IYAKISE RAPHAEL WELCOME YOU TO THE SHOW!</p>');
// }


// if(!defined('__SHOW_SUCCESS__')) {
//     define('__SHOW_SUCCESS__', true); // Set to true to show success message
// }
if(!defined('__GOOGLE_APP_PASSWORD__')) {
    define('__GOOGLE_APP_PASSWORD__', 'ofmicgscfvdkwwwn'); // Use your actual Google App Password
}