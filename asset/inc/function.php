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