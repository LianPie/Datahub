<?php
session_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../Database/db_config.php';

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
    exit();
}

$user_id = $_SESSION["user_id"];
$user_email = $_SESSION["email"];

// Base upload directory
$base_upload_dir = __DIR__ . "/../uploads/";

// Check user storage limit
function checkUserStorage($user_id, $file_size, $conn) {
    $sql = "SELECT storage_limit, storage_used FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    $new_total = $user['storage_used'] + $file_size;
    
    if ($new_total > $user['storage_limit']) {
        $available = $user['storage_limit'] - $user['storage_used'];
        return [
            "allowed" => false, 
            "message" => "Not enough storage. Available: " . formatBytes($available)
        ];
    }
    
    return ["allowed" => true];
}

// Update storage used after upload
function updateStorageUsed($user_id, $file_size, $conn) {
    $sql = "UPDATE users SET storage_used = storage_used + ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("di", $file_size, $user_id);
    return $stmt->execute();
}

// Format bytes function
function formatBytes($bytes) {
    if ($bytes === 0) return '0 B';
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = floor(log($bytes, 1024));
    return round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
}

// Create user folder based on email
function getUserFolder($user_email, $base_dir) {
    $folder_name = preg_replace('/[^a-zA-Z0-9]/', '_', $user_email);
    $user_folder = $base_dir . $folder_name;
    
    if (!file_exists($user_folder)) {
        mkdir($user_folder, 0755, true);
    }
    
    return $user_folder;
}

// Get folder size recursively
function getFolderSize($folder_path) {
    $total_size = 0;
    
    if (!is_dir($folder_path)) {
        return 0;
    }
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($folder_path, RecursiveDirectoryIterator::SKIP_DOTS)
    );
    
    foreach ($files as $file) {
        if ($file->isFile()) {
            $total_size += $file->getSize();
        }
    }
    
    return $total_size;
}

// Format bytes to human readable
function formatSize($bytes) {
    if ($bytes === 0) return '0 B';
    
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = floor(log($bytes, 1024));
    
    return round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
}

// Create folder inside user directory
function createUserFolder($folder_name, $user_folder) {
    $safe_name = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $folder_name);
    $new_folder = $user_folder . '/' . $safe_name;
    
    if (!file_exists($new_folder)) {
        mkdir($new_folder, 0755, true);
        return ["success" => true, "path" => $safe_name];
    } else {
        return ["success" => false, "message" => "Folder already exists"];
    }
}

// Handle file upload
function uploadFile($file, $user_folder, $conn, $user_id, $subfolder = '') {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ["success" => false, "message" => "Upload error: " . $file['error']];
    }
    
    // Check storage limit first
    $storage_check = checkUserStorage($user_id, $file['size'], $conn);
    if (!$storage_check['allowed']) {
        return ["success" => false, "message" => $storage_check['message']];
    }
    
    $max_size = 50 * 1024 * 1024; // 50MB max per file
    if ($file['size'] > $max_size) {
        return ["success" => false, "message" => "File too large. Max 50MB per file"];
    }
    
    $allowed_types = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/zip', 'application/x-zip-compressed'
    ];
    
    if (!in_array($file['type'], $allowed_types)) {
        return ["success" => false, "message" => "File type not allowed"];
    }
    
    $original_name = basename($file['name']);
    $safe_name = preg_replace('/[^a-zA-Z0-9._\-]/', '_', $original_name);
    $unique_name = time() . '_' . $safe_name;
    
    $target_dir = $user_folder;
    if (!empty($subfolder)) {
        $clean_subfolder = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $subfolder);
        $target_dir .= '/' . $clean_subfolder;
        
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0755, true);
        }
    }
    
    $target_path = $target_dir . '/' . $unique_name;
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        // Update storage used in database
        updateStorageUsed($user_id, $file['size'], $conn);
        
        return [
            "success" => true,
            "filename" => $original_name,
            "saved_name" => $unique_name,
            "path" => $target_path,
            "size" => $file['size'],
            "size_formatted" => formatBytes($file['size'])
        ];
    } else {
        return ["success" => false, "message" => "Failed to save file"];
    }
}

// Get user's files structure
function getUserFiles($user_folder) {
    $files = [];
    
    if (!is_dir($user_folder)) {
        return $files;
    }
    
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($user_folder, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ($iterator as $item) {
        $relative_path = str_replace($user_folder . '/', '', $item->getPathname());
        
        if ($item->isDir()) {
            $files['folders'][] = $relative_path;
        } else {
            $files['files'][] = [
                'name' => basename($item->getPathname()),
                'path' => $relative_path,
                'size' => $item->getSize(),
                'size_formatted' => formatSize($item->getSize()),
                'modified' => date('Y-m-d H:i:s', $item->getMTime())
            ];
        }
    }
    
    return $files;
}

// Handle AJAX requests
if ($_SERVER["REQUEST_METHOD"] == "POST" && 
    isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    
    header('Content-Type: application/json');
    $action = $_POST["action"] ?? '';
    
    $user_folder = getUserFolder($user_email, $base_upload_dir);
    
    switch ($action) {
        case 'get_storage_info':
            $total_size = getFolderSize($user_folder);
            $response = [
                "success" => true,
                "total_size_bytes" => $total_size,
                "total_size_formatted" => formatSize($total_size),
                "max_size_bytes" => 1073741824, // 1GB limit
                "max_size_formatted" => "1 GB",
                "usage_percent" => round(($total_size / 1073741824) * 100, 2)
            ];
            break;
            
        case 'get_files':
            $files = getUserFiles($user_folder);
            $response = ["success" => true, "data" => $files];
            break;
            
        case 'create_folder':
            $folder_name = $_POST["folder_name"] ?? '';
            if (empty($folder_name)) {
                $response = ["success" => false, "message" => "Folder name required"];
            } else {
                $response = createUserFolder($folder_name, $user_folder);
            }
            break;
            
        case 'upload_file':
            if (!isset($_FILES['file'])) {
                $response = ["success" => false, "message" => "No file uploaded"];
            } else {
                $subfolder = $_POST["subfolder"] ?? '';
                $response = uploadFile($_FILES['file'], $user_folder, $subfolder);
            }
            break;
            
        default:
            $response = ["success" => false, "message" => "Invalid action"];
    }
    
    echo json_encode($response);

    if (isset($conn)) {
    $conn->close();
}
    exit();
}

// Handle file download
if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['download'])) {
    $file_path = $_GET['path'] ?? '';
    $user_folder = getUserFolder($user_email, $base_upload_dir);
    $full_path = $user_folder . '/' . $file_path;

    if (isset($conn)) {
    $conn->close();
    }

    // Security: ensure file is inside user folder
    if (strpos(realpath($full_path), realpath($user_folder)) === 0 && file_exists($full_path)) {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($full_path) . '"');
        readfile($full_path);
        exit();
    } else {
        http_response_code(403);
        echo "Access denied";
        exit();
    }
}

// Close database connection
if (isset($conn)) {
    $conn->close();
}
?>