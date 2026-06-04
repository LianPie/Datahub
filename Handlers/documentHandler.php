<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$params = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = $_POST;
} else {
    $params = $_GET;
}

$action = $params['action'] ?? null;
$name = $params['name'] ?? null;

require_once __DIR__ . '/../Database/DbConfig.php';

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
    exit();
}

$user_id = $_SESSION["user_id"];
$user_email = $_SESSION["email"];

// Create safe folder name from email (replace special characters)
$safe_folder_name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $user_email);
$base_upload_dir = __DIR__ . "/../uploads/";
$user_folder = $base_upload_dir . $safe_folder_name;
$docs_folder = $user_folder . '/docs';

// Create docs folder if it doesn't exist
if (!is_dir($docs_folder)) {
    mkdir($docs_folder, 0777, true);
}

// Helper function to format bytes
function formatBytes($bytes, $precision = 2) {
    if ($bytes === 0) return '0 Bytes';
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}

// escape HTML for JSON
function escapeHtml($str) {
    if (!$str) return '';
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
header('Content-Type: application/json');

switch ($action) {
    case 'list_documents':
        $documents = [];
        
        if (is_dir($docs_folder)) {
            $files = scandir($docs_folder);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                
                $file_path = $docs_folder . '/' . $file;
                $file_ext = pathinfo($file, PATHINFO_EXTENSION);
                $relative_path = 'docs/' . $file;
                
                // Only show HTML files
                if (strtolower($file_ext) === 'html') {
                    $stat = stat($file_path);
                    $documents[] = [
                        'name' => pathinfo($file, PATHINFO_FILENAME),
                        'path' => $relative_path,
                        'file' => $file,
                        'modified' => date('Y-m-d H:i:s', filemtime($file_path)),
                        'size' => filesize($file_path),
                        'size_formatted' => formatBytes(filesize($file_path))
                    ];
                }
            }
            
            // Sort by modified date, newest first
            usort($documents, function($a, $b) {
                return strtotime($b['modified']) - strtotime($a['modified']);
            });
        }
        
        echo json_encode(['success' => true, 'documents' => $documents]);
        break;
        
    case 'save':
        $name = $_POST['name'] ?? '';
        $content = $_POST['content'] ?? '';
        
        // Sanitize name - only allow alphanumeric, spaces, hyphens, underscores
        $name = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $name);
        $name = trim($name);
        
        if (empty($name)) {
            echo json_encode(['success' => false, 'message' => 'Invalid document name']);
            exit;
        }
        
        // Create filename with .html extension
        $filename = $name . '.html';
        $file_path = $docs_folder . '/' . $filename;
        
        // Add basic HTML structure if it's a new document or replace content
        $full_content = '<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>' . escapeHtml($name) . '</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 900px;
                            margin: 0 auto;
                            padding: 40px 20px;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            margin-top: 1.5em;
                            margin-bottom: 0.5em;
                        }
                        p {
                            margin-bottom: 1em;
                        }
                    </style>
                </head>
                <body>
                    ' . $content . '
                </body>
                </html>';
        
        if (file_put_contents($file_path, $full_content)) {
            echo json_encode(['success' => true, 'message' => 'Document saved successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save document - check permissions']);
        }
        break;
        
    case 'load':
        $name = $_POST['name'] ?? $_GET['name'] ?? '';
        
        // Sanitize name
        $name = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $name);
        $filename = $name . '.html';
        $file_path = $docs_folder . '/' . $filename;
        
        if (file_exists($file_path)) {
            // Extract body content from HTML file
            $content = file_get_contents($file_path);
            
            // Try to extract content between body tags
            if (preg_match('/<body[^>]*>(.*?)<\/body>/is', $content, $matches)) {
                $content = $matches[1];
            }
            
            echo json_encode([
                'success' => true, 
                'content' => $content,
                'name' => $name
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Document not found']);
        }
        break;
        
    case 'delete':
        $name = $_POST['name'] ?? '';
        
        // Sanitize name
        $name = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $name);
        $filename = $name . '.html';
        $file_path = $docs_folder . '/' . $filename;
        
        if (file_exists($file_path)) {
            if (unlink($file_path)) {
                echo json_encode(['success' => true, 'message' => 'Document deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete document - check permissions']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Document not found']);
        }
        break;
        
   case 'upload_image':
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imagesDir = $docs_folder . '/images';
        
        if (!file_exists($imagesDir)) {
            mkdir($imagesDir, 0777, true);
        }
        
        $file = $_FILES['image'];
        $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        $safeName = preg_replace('/[^a-zA-Z0-9\-_]/', '_', $originalName);
        $fileName = $safeName . '.' . $extension;
        $filePath = $imagesDir . '/' . $fileName;
        
        if (file_exists($filePath)) {
            $imageUrl = '/Datahub/serve_image.php?file=' . urlencode($fileName);
            echo json_encode(['success' => true, 'url' => $imageUrl, 'message' => 'File already exists']);
            break;
        }
        
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            $imageUrl = '/Datahub/serve_image.php?file=' . urlencode($fileName);
            echo json_encode(['success' => true, 'url' => $imageUrl]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No image uploaded']);
    }
    break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?>