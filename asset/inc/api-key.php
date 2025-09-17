<?php
if (!defined('SENDGRID_API')) {
    define('SENDGRID_API', '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'); //sendgrid api
    // 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      new
    // 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      old
}
// if (!defined('SENDER_EMAIL_ADDRESS')) {
//     define('SENDER_EMAIL_ADDRESS', 'xpertsbridge@justiceuyompcs.com.ng'); //replace this with xpertbrige email address set or create in cpanel
// }


// if (!defined('PAYSTACK_KEY')) {
//     define('PAYSTACK_KEY', 'pk_test_74b290cf8d60e986fc24cd20485d9cc742575988'); //paystack key
// }
// if (!defined('PAYSTACK_SECRET_KEY')) {
//     define('PAYSTACK_SECRET_KEY', 'sk_test_e959b9432f54a30704f6fa69eb530e989efcb39d'); //paystck secret key
// }
// if (!defined('PAYSTACK_PUBLIC_KEY')) {
//     define('PAYSTACK_PUBLIC_KEY', 'pk_test_74b290cf8d60e986fc24cd20485d9cc742575988'); //paystack public
// }

//my temporary paystack keys start
if (!defined('PAYSTACK_KEY')) {
    define('PAYSTACK_KEY', 'pk_live_50776a87272f1e2afaa2c3d2e75ec103c3e0e910'); //paystack key
}
if (!defined('PAYSTACK_SECRET_KEY')) {
    define('PAYSTACK_SECRET_KEY', 'sk_live_cd71d9f0ebb033a43823dea5daeb207a6a79b1cd'); //paystck secret key
}
if (!defined('PAYSTACK_PUBLIC_KEY')) {
    define('PAYSTACK_PUBLIC_KEY', 'pk_live_50776a87272f1e2afaa2c3d2e75ec103c3e0e910'); //paystack public
}

// temporay paystack keys end




if (!defined('NOW_PAYMENT_API_KEY')) {
    define('NOW_PAYMENT_API_KEY', '3NXPMVX-R2GMEJW-MBQGP45-XR4S517'); //now payment public key main
}
if (!defined('NOW_PAYMENT_PUBLIC_KEY')) {
    define('NOW_PAYMENT_PUBLIC_KEY', '3c910403-d17c-4e9e-9aed-c942c78869cf'); //now payment secret key main
}

// if (!defined('NOW_PAYMENT_API_KEY')) {
//     define('NOW_PAYMENT_API_KEY', 'S3KYP89-EA0M9W9-PST8SHZ-KARPEHD'); //now payment public key test myown
// }
// if (!defined('NOW_PAYMENT_PUBLIC_KEY')) {
//     define('NOW_PAYMENT_PUBLIC_KEY', 'fc880c86-738f-4cc1-ae21-710d63984159'); //now payment secret key test myown
// }

if (!defined('XPERTBRIDGE_CONTACT_MAILTO')) {
    define('XPERTBRIDGE_CONTACT_MAILTO', 'pauljonah86@gmail.com'); //contact us email forwarder to be replace
}

//lgn pwd
if(!defined('NOWPAYMENTS_EMAIL')){
    define('NOWPAYMENTS_EMAIL', 'pauljonah86@gmail.com');
}

if(!defined('NOWPAYMENTS_PASSWORD')){
    define('NOWPAYMENTS_PASSWORD', 'Qwertyuiop1');
}



if (!defined('EXCHANGERATE_API_KEY')) {
    define('EXCHANGERATE_API_KEY', 'd91461d32969c1d903d28fb7'); //EXCHANGERATE_API_KEY
}

if (!defined('RECAPTCHAKEY_FRONT')) {
    define('RECAPTCHAKEY_FRONT', '6Ld3Y1crAAAAANyo4Ihp2gN8tLg8PKT7gxUXSsvb'); //RECAPTCHA
}

if (!defined('RECAPTCHAKEY_SECRET')) {
    define('RECAPTCHAKEY_SECRET', '6Ld3Y1crAAAAABzSLLbQ73Pznbc8d1MqJWqB4qVu'); //RECAPTCHA
}

//LOGIN WITH GOOGLE CREDENTIALS
if(!defined('GOOGLE_CLIENT_ID')){
    define('GOOGLE_CLIENT_ID', '550754907828-5lrvtjgave2d8v2gmqlmu4893m6cn2lp.apps.googleusercontent.com');
}

if(!defined('GOOGLE_CLIENT_SECRET_KEY')){
    define('GOOGLE_CLIENT_SECRET_KEY', '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');
}

//INPS : DNqroJW8/F7dzAldk+qbIqEZTQLmCciG



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