<?php
session_start();

if (!isset($_SESSION["user_id"])) {
    header('HTTP/1.0 403 Forbidden');
    exit();
}

$file = $_GET['file'] ?? '';
$safe_folder_name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $_SESSION["email"]);
$imagePath = __DIR__ . '/uploads/' . $safe_folder_name . '/docs/images/' . basename($file);

if (file_exists($imagePath)) {
    $mime = mime_content_type($imagePath);
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($imagePath));
    readfile($imagePath);
} else {
    header('HTTP/1.0 404 Not Found');
    echo 'Image not found';
}
?>