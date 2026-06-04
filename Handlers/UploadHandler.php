<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../Database/DbConfig.php';

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

function getUserStorageInfo($user_id, $user_folder, $conn) {
    // Get storage data from database
    $sql = "SELECT storage_limit, storage_used FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    $storage_limit = $user['storage_limit'] ?? 1073741824;
    $storage_used = $user['storage_used'] ?? 0;
    
    // Sync with actual folder size
    $actual_size = getFolderSize($user_folder);
    if ($actual_size != $storage_used) {
        $update_sql = "UPDATE users SET storage_used = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("ii", $actual_size, $user_id);
        $update_stmt->execute();
        $storage_used = $actual_size;
    }
    
    $usage_percent = ($storage_used / $storage_limit) * 100;
    
    return [
        "success" => true,
        "total_size_bytes" => $storage_used,
        "total_size_formatted" => formatSize($storage_used),
        "max_size_bytes" => $storage_limit,
        "max_size_formatted" => formatSize($storage_limit),
        "usage_percent" => round($usage_percent, 2),
        "free_percent" => round(100 - $usage_percent, 2),
        "free_bytes" => $storage_limit - $storage_used,
        "free_formatted" => formatSize($storage_limit - $storage_used)
    ];
}


// create nested fodlers
function createUserFolder($folder_name, $user_folder, $subfolder = '') {
    $safe_name = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $folder_name);
    
     if (empty($subfolder) && in_array(strtolower($safe_name), ['docs', 'trash'])) {
        return ["success" => false, "message" => "This folder name is reserved and cannot be used"];
    }

    $target_dir = $user_folder;
    if (!empty($subfolder)) {
        $clean_subfolder = preg_replace('/[^a-zA-Z0-9_\-]/', '/', $subfolder);
        $target_dir .= '/' . $clean_subfolder;
    }
    
    $new_folder = $target_dir . '/' . $safe_name;
    
    if (!file_exists($new_folder)) {
        mkdir($new_folder, 0755, true);
        
        $full_path = $safe_name;
        if (!empty($subfolder)) {
            $full_path = $subfolder . '/' . $safe_name;
        }
        
        return ["success" => true, "path" => $full_path];
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
    
    $max_size = 100 * 1024 * 1024; // 100MB max per file (increased)
    if ($file['size'] > $max_size) {
        return ["success" => false, "message" => "File too large. Max 100MB per file"];
    }
    
    // Define allowed MIME types (expanded to accept almost everything except dangerous ones)
    $allowed_types = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff', 'image/x-icon',
        
        // Adobe Files
        'application/pdf', 'application/postscript', 'application/illustrator', 'application/x-photoshop',
        'application/photoshop', 'image/vnd.adobe.photoshop', 'application/psd',
        'application/x-indesign', 'application/vnd.adobe.indesign',
        'application/x-illustrator', 'application/x-photoshop',
        'application/x-mimearchive', 'application/x-shockwave-flash',

        
        // CorelDRAW Files
        'application/cdr',
        'application/coreldraw',
        'application/vnd.corel-draw',
        'application/x-cdr',
        'application/x-coreldraw',
        'image/cdr',
        'image/x-cdr',
        'zz-application/zz-winassoc-cdr',
        
        // Microsoft Office Documents
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.ms-access', // .mdb
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template', // .dotx
        'application/vnd.ms-word.document.macroenabled.12', // .docm
        'application/vnd.ms-excel.sheet.macroenabled.12', // .xlsm
        'application/vnd.ms-powerpoint.presentation.macroenabled.12', // .pptm
        
        // Apple iWork
        'application/vnd.apple.pages', // .pages
        'application/vnd.apple.numbers', // .numbers
        'application/vnd.apple.keynote', // .keynote
        
        // Text & Markup
        'text/plain', 'text/html', 'text/css', 'text/csv', 'text/xml', 'application/xml', 
        'text/markdown', 'text/rtf', 'text/richtext', 'application/rtf',
        
        // Archives & Compressed
        'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
        'application/x-tar', 'application/gzip', 'application/vnd.rar',
        'application/x-7z-compressed', 'application/x-bzip2', 'application/x-xz',
        
        // Videos
        'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm', 'video/quicktime',
        'video/x-msvideo', 'video/x-matroska', 'video/mov', 'video/avi', 'video/mkv',
        'video/3gpp', 'video/x-flv', 'video/x-ms-wmv', 'video/mp2t',
        
        // Audio / Music
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/vorbis',
        'audio/opus', 'audio/flac', 'audio/m4a', 'audio/aac', 'audio/x-m4a',
        
        // Programming & Data
        'application/json', 'application/javascript', 'text/javascript',
        'text/x-python', 'text/x-php', 'text/x-java-source', 'text/x-c',
        'text/x-c++', 'text/x-sh', 'text/x-perl', 'text/x-ruby',
        'text/x-go', 'text/x-rust', 'text/x-swift',
        
        // Fonts
        'font/ttf', 'font/otf', 'font/woff', 'font/woff2',
        
        // Ebooks
        'application/epub+zip', 'application/x-mobipocket-ebook',
        
        // CAD & 3D
        'application/dwg', 'image/vnd.dwg', 'application/x-autocad',
        'model/stl', 'model/obj', 'application/x-step',
        
        // Database
        'application/x-sql', 'application/sql',
        
        // Contact & Calendar
        'text/vcard', 'text/calendar',
        
        // Generic binary files (limited - some may be dangerous)
        'application/octet-stream'
    ];
    
    // Add MIME type detection fallback
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detected_type = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    // Block dangerous file types
    $dangerous_extensions = ['php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'msi', 'bat', 'cmd', 'sh', 
                             'js', 'vbs', 'ps1', 'py', 'pl', 'cgi', 'htaccess', 'htpasswd',
                                'ini', 'cfg', 'conf', 'env', '.env'];
    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (in_array($file_ext, $dangerous_extensions)) {
        return ["success" => false, "message" => "file_type_not_allowed_security"];
    }
    
    // Check if file is allowed (by MIME type or extension)
    if (!in_array($file['type'], $allowed_types) && !in_array($detected_type, $allowed_types)) {
        return ["success" => false, "message" => "file_type_not_allowed" . $file['type']];
    }
    
    $original_name = basename($file['name']);
    $safe_name = preg_replace('/[^a-zA-Z0-9._\-]/', '_', $original_name);
    $unique_name = time() . '_' . $safe_name;
    
    $target_dir = $user_folder;
    if (!empty($subfolder)) {
        $clean_subfolder = preg_replace('/[^a-zA-Z0-9_\-]/', '/', $subfolder);
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
        return ["success" => false, "message" => "failed_to_upload_file"];
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

// Get contents of specific folder (not recursive)
function getFolderContents($user_folder, $subfolder = '', $search = '', $filter = '') {
    $target_dir = $user_folder;
    if (!empty($subfolder)) {
        $clean_subfolder = preg_replace('/[^a-zA-Z0-9_\-]/', '/', $subfolder);
        $target_dir .= '/' . $clean_subfolder;
    }
    
    $result = [
        'folders' => [],
        'files' => [],
        'current_path' => $subfolder
    ];
    
    if (!is_dir($target_dir)) {
        return $result;
    }
    
    if (!empty($search)) {
    return searchFilesRecursive($user_folder, $search, $filter);
    }

    $items = scandir($target_dir);
    
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }
        
        if (empty($subfolder) && ($item == 'docs' || $item == 'trash')) {
                    continue;
    }

        $item_path = $target_dir . '/' . $item;
        
        if (is_dir($item_path)) {
            $result['folders'][] = [
                'name' => $item,
                'path' => empty($subfolder) ? $item : $subfolder . '/' . $item,
                'type' => 'folder',
                'modified' => date('Y-m-d H:i:s', filemtime($item_path))
            ];
        } else {
            
            $extension = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            
            // Apply filter
            if (!empty($filter) && $filter != 'all') {
                if (!matchesFilter($extension, $filter)) {
                    continue;
                }
            }


            $size = filesize($item_path);
            $result['files'][] = [
                'name' => $item,
                'path' => empty($subfolder) ? $item : $subfolder . '/' . $item,
                'type' => 'file',
                'size' => $size,
                'size_formatted' => formatSize($size),
                'modified' => date('Y-m-d H:i:s', filemtime($item_path)),
                'extension' => pathinfo($item, PATHINFO_EXTENSION),
            ];
        }
    }
    
    // Sort folders first, then files
    usort($result['folders'], function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    usort($result['files'], function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    return $result;
}

// Search files recursively
function searchFilesRecursive($user_folder, $search, $filter = '') {
    $result = [
        'folders' => [],
        'files' => [],
        'current_path' => '',
        'is_search' => true
    ];
    
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($user_folder, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    $search_lower = strtolower($search);
    
    foreach ($iterator as $item) {
        $relative_path = str_replace($user_folder . '/', '', $item->getPathname());
        
        // Skip docs and trash folders
        if (strpos($relative_path, 'docs/') === 0 || strpos($relative_path, 'trash/') === 0) {
            continue;
        }
        
        $name = $item->getFilename();
        
        // Check if name matches search
        if (stripos($name, $search_lower) !== false) {
            if ($item->isDir()) {
                // Don't show folders in search results
                continue;
            } else {
                $extension = strtolower($item->getExtension());
                
                // Apply filter
                if (!empty($filter) && $filter != 'all') {
                    if (!matchesFilter($extension, $filter)) {
                        continue;
                    }
                }
                
                $result['files'][] = [
                    'name' => $name,
                    'path' => $relative_path,
                    'type' => 'file',
                    'size' => $item->getSize(),
                    'size_formatted' => formatSize($item->getSize()),
                    'modified' => date('Y-m-d H:i:s', $item->getMTime()),
                    'extension' => $extension,
                ];
            }
        }
    }
    
    return $result;
}

// Helper function to check if extension matches filter
function matchesFilter($extension, $filter) {
    $image_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
    $video_exts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
    $audio_exts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'];
    $document_exts = ['pdf', 'doc', 'docx', 'txt', 'html', 'htm', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    switch ($filter) {
        case 'image':
            return in_array($extension, $image_exts);
        case 'video':
            return in_array($extension, $video_exts);
        case 'audio':
            return in_array($extension, $audio_exts);
        case 'document':
            return in_array($extension, $document_exts);
        case 'other':
            $all_exts = array_merge($image_exts, $video_exts, $audio_exts, $document_exts);
            return !in_array($extension, $all_exts);
        default:
            return true;
    }
}


// Get recent files 
function getRecentFiles($user_folder, $limit = 3) {
    $recent_files = [];
    
    if (!is_dir($user_folder)) {
        return $recent_files;
    }
    
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($user_folder, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $relative_path = str_replace($user_folder . DIRECTORY_SEPARATOR, '', $file->getPathname());
            $relative_path = str_replace('\\', '/', $relative_path);
            
            if (strpos($relative_path, 'trash/') === 0) {
                continue;
            }

            $is_doc = (strpos($relative_path, 'docs/') === 0 && $file->getExtension() == 'html');

            $recent_files[] = [
                'name' => $file->getFilename(),
                'path' => $relative_path,  
                'size' => $file->getSize(),
                'size_formatted' => formatSize($file->getSize()),
                'modified' => $file->getMTime(),
                'modified_formatted' => date('Y-m-d H:i:s', $file->getMTime()),
                'extension' => strtolower($file->getExtension()),
                'is_document' => $is_doc  
            ];
        }
    }
    
    usort($recent_files, function($a, $b) {
        return $b['modified'] - $a['modified'];
    });
    
    
    return array_slice($recent_files, 0, $limit);
}

function getRecentFolders($user_folder, $limit = 3) {
    $recent_folders = [];
    
    if (!is_dir($user_folder)) {
        return $recent_folders;
    }
    
    $items = scandir($user_folder);
    
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }
        
        if (($item == 'docs' || $item == 'trash')) {
            continue;
    }
        $item_path = $user_folder . '/' . $item;
        
        if (is_dir($item_path)) {
            $recent_folders[] = [
                'name' => $item,
                'path' => $item,
                'modified' => filemtime($item_path),
                'modified_formatted' => date('Y-m-d H:i:s', filemtime($item_path)),
                'item_count' => count(scandir($item_path)) - 2 
            ];
        }
    }
    
    usort($recent_folders, function($a, $b) {
        return $b['modified'] - $a['modified'];
    });
    
    return array_slice($recent_folders, 0, $limit);
}


//========trash and recovery
function getTrashFolder($user_folder) {
    $trash_path = $user_folder . '/trash';
    if (!is_dir($trash_path)) {
        mkdir($trash_path, 0755, true);
    }
    return $trash_path;
}

function getTrashMetadataPath($user_folder) {
    return $user_folder . '/trash/.trash_metadata.json';
}

// Save item to trash
function moveToTrash($user_folder, $item_path, $is_folder) {
    $trash_folder = getTrashFolder($user_folder);
    $metadata_path = getTrashMetadataPath($user_folder);
    
    $full_path = $user_folder . '/' . $item_path;
    
    if (!file_exists($full_path)) {
        return ["success" => false, "message" => "item_not_found"];
    }
    
    // Get size BEFORE moving to trash
    $item_size = $is_folder ? getFolderSize($full_path) : filesize($full_path);

    // Generate unique name for trash to avoid conflicts
    $original_name = basename($item_path);
    $timestamp = time();
    $unique_name = $timestamp . '_' . $original_name;
    $trash_dest = $trash_folder . '/' . $unique_name;
    
    // Move item to trash
    if (rename($full_path, $trash_dest)) {
        // Load existing metadata
        $metadata = [];
        if (file_exists($metadata_path)) {
            $metadata = json_decode(file_get_contents($metadata_path), true);
        }
        
        // Add metadata for recovery
        $metadata[] = [
            'id' => $timestamp,
            'original_path' => $item_path,
            'original_name' => $original_name,
            'trash_name' => $unique_name,
            'is_folder' => $is_folder,
            'deleted_at' => date('Y-m-d H:i:s', $timestamp),
            'size' => $item_size,
        ];
        
        file_put_contents($metadata_path, json_encode($metadata, JSON_PRETTY_PRINT));
        
        return ["success" => true, "message" => "delete_success"];
    } else {
        return ["success" => false, "message" => "move_to_trash_failed"];
    }
}

// Restore item from trash
function restoreFromTrash($user_folder, $trash_item_id) {
    $trash_folder = getTrashFolder($user_folder);
    $metadata_path = getTrashMetadataPath($user_folder);
    
    if (!file_exists($metadata_path)) {
        return ["success" => false, "message" => "No trash metadata found"];
    }
    
    $metadata = json_decode(file_get_contents($metadata_path), true);
    $item_meta = null;
    $item_index = null;
    
    foreach ($metadata as $index => $item) {
        if ($item['id'] == $trash_item_id) {
            $item_meta = $item;
            $item_index = $index;
            break;
        }
    }
    
    if (!$item_meta) {
        return ["success" => false, "message" => "Item not found in trash"];
    }
    
    $trash_path = $trash_folder . '/' . $item_meta['trash_name'];
    $restore_path = $user_folder . '/' . $item_meta['original_path'];
    
    // Check if original location exists and handle conflicts
    if (file_exists($restore_path)) {
        $counter = 1;
        $path_parts = pathinfo($item_meta['original_path']);
        $new_name = $path_parts['filename'] . '_restored_' . $counter;
        if (isset($path_parts['extension'])) {
            $new_name .= '.' . $path_parts['extension'];
        }
        $restore_path = $user_folder . '/' . dirname($item_meta['original_path']) . '/' . $new_name;
    }
    
    // Create parent directory if it doesn't exist
    $parent_dir = dirname($restore_path);
    if (!is_dir($parent_dir)) {
        mkdir($parent_dir, 0755, true);
    }
    
    // Restore item
    if (rename($trash_path, $restore_path)) {
        // Remove metadata
        unset($metadata[$item_index]);
        $metadata = array_values($metadata);
        file_put_contents($metadata_path, json_encode($metadata, JSON_PRETTY_PRINT));
        
        return ["success" => true, "message" => "Item restored successfully", "restored_path" => $item_meta['original_path']];
    } else {
        return ["success" => false, "message" => "Failed to restore"];
    }
}

// Permanently delete from trash
function permanentDelete($user_folder, $trash_item_id) {
    $trash_folder = getTrashFolder($user_folder);
    $metadata_path = getTrashMetadataPath($user_folder);
    
    if (!file_exists($metadata_path)) {
        return ["success" => false, "message" => "No trash metadata found"];
    }
    
    $metadata = json_decode(file_get_contents($metadata_path), true);
    $item_meta = null;
    $item_index = null;
    
    foreach ($metadata as $index => $item) {
        if ($item['id'] == $trash_item_id) {
            $item_meta = $item;
            $item_index = $index;
            break;
        }
    }
    
    if (!$item_meta) {
        return ["success" => false, "message" => "Item not found in trash"];
    }
    
    $trash_path = $trash_folder . '/' . $item_meta['trash_name'];
    
    // Delete item permanently
    if (is_dir($trash_path)) {
        deleteDirectory($trash_path);
    } else {
        unlink($trash_path);
    }
    
    // Remove metadata
    unset($metadata[$item_index]);
    $metadata = array_values($metadata);
    file_put_contents($metadata_path, json_encode($metadata, JSON_PRETTY_PRINT));
    
    return ["success" => true, "message" => "Item permanently deleted"];
}

// Delete directory recursively
function deleteDirectory($dir) {
    if (!file_exists($dir)) {
        return true;
    }
    if (!is_dir($dir)) {
        return unlink($dir);
    }
    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }
        if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
            return false;
        }
    }
    return rmdir($dir);
}

// Get trash contents
function getTrashContents($user_folder) {
    $trash_folder = getTrashFolder($user_folder);
    $metadata_path = getTrashMetadataPath($user_folder);
    
    if (!file_exists($metadata_path)) {
        return [];
    }
    
    $metadata = json_decode(file_get_contents($metadata_path), true);
    
    // Sort by deleted date (newest first)
    usort($metadata, function($a, $b) {
        return $b['id'] - $a['id'];
    });
    
    return $metadata;
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
            $response = getUserStorageInfo($user_id, $user_folder, $conn);
            break;
            
        case 'get_files':
            $files = getUserFiles($user_folder);
            $response = ["success" => true, "data" => $files];
            break;
            
        case 'create_folder':
            $folder_name = $_POST["folder_name"] ?? '';
            $current_path = $_POST["current_path"] ?? ''; 
            if (empty($folder_name)) {
                $response = ["success" => false, "message" => "Folder name required"];
            } else {
                $response = createUserFolder($folder_name, $user_folder, $current_path);
            }
            break;
            
        case 'upload_file':
            if (!isset($_FILES['file'])) {
                $response = ["success" => false, "message" => "No file uploaded"];
            } else {
                $subfolder = $_POST["subfolder"] ?? '';
                $response = uploadFile($_FILES['file'], $user_folder,  $conn,$user_id, $subfolder);
            }
            break;
            
        case 'get_folder_contents':
            $folder_path = $_POST["folder_path"] ?? '';
            $search = $_POST["search"] ?? '';
            $filter = $_POST["filter"] ?? 'all';
            $contents = getFolderContents($user_folder, $folder_path, $search, $filter);
            $response = ["success" => true, "data" => $contents];
            break;

        case 'get_recent_items':
            $recent_files = getRecentFiles($user_folder, 3);
            $recent_folders = getRecentFolders($user_folder, 3);
            $response = [
                "success" => true,
                "recent_files" => $recent_files,
                "recent_folders" => $recent_folders
            ];
            break;

         // ============ TRASH ACTIONS ============
        
        case 'delete_item':
            $item_path = $_POST['item_path'] ?? '';
            $is_folder = isset($_POST['is_folder']) && $_POST['is_folder'] == '1';
            
            if (empty($item_path)) {
                $response = ["success" => false, "message" => "invalid_path"];
            } else {
                $response = moveToTrash($user_folder, $item_path, $is_folder);
            }
            break;

        case 'get_trash_contents':
            $trash_items = getTrashContents($user_folder);
            $response = ["success" => true, "trash_items" => $trash_items];
            break;

        case 'restore_item':
            $item_id = $_POST['item_id'] ?? '';
            
            if (empty($item_id)) {
                $response = ["success" => false, "message" => "Invalid item ID"];
            } else {
                $response = restoreFromTrash($user_folder, $item_id);
            }
            break;

        case 'permanent_delete':
            $item_id = $_POST['item_id'] ?? '';
            
            if (empty($item_id)) {
                $response = ["success" => false, "message" => "Invalid item ID"];
            } else {
                $response = permanentDelete($user_folder, $item_id);
            }
            break;

        case 'empty_trash':
            $trash_folder = getTrashFolder($user_folder);
            $metadata_path = getTrashMetadataPath($user_folder);
            
            deleteDirectory($trash_folder);
            mkdir($trash_folder, 0755, true);
            
            if (file_exists($metadata_path)) {
                unlink($metadata_path);
            }
            
            $response = ["success" => true, "message" => "Trash emptied successfully"];
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
  
        $file_size = filesize($full_path);
        $file_extension = strtolower(pathinfo($full_path, PATHINFO_EXTENSION));
        
        // MIME types
        $mime_types = [
            'mp4' => 'video/mp4', 'webm' => 'video/webm', 'ogg' => 'video/ogg',
            'mp3' => 'audio/mpeg', 'wav' => 'audio/wav', 'm4a' => 'audio/mp4',
            'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
            'gif' => 'image/gif', 'webp' => 'image/webp', 'pdf' => 'application/pdf'
        ];
        
        $mime_type = $mime_types[$file_extension] ?? 'application/octet-stream';
        
        // files with preview modal
        $inline_types = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav', 'ogg'];
        
        header('Access-Control-Allow-Origin: *');
        header('Accept-Ranges: bytes');
        header('Content-Type: ' . $mime_type);
        
        if (in_array($file_extension, $inline_types)) {
            header('Content-Disposition: inline; filename="' . basename($full_path) . '"');
        } else {
            header('Content-Disposition: attachment; filename="' . basename($full_path) . '"');
        }
        
        $start = 0;
        $end = $file_size - 1;
        
        if (isset($_SERVER['HTTP_RANGE'])) {
            $range = $_SERVER['HTTP_RANGE'];
            $range = str_replace('bytes=', '', $range);
            $range_parts = explode('-', $range);
            $start = intval($range_parts[0]);
            
            if (isset($range_parts[1]) && !empty($range_parts[1])) {
                $end = intval($range_parts[1]);
            }
            
            header('HTTP/1.1 206 Partial Content');
            header('Content-Range: bytes ' . $start . '-' . $end . '/' . $file_size);
        } else {
            header('HTTP/1.1 200 OK');
        }
        
        $length = $end - $start + 1;
        header('Content-Length: ' . $length);
        
        $fp = fopen($full_path, 'rb');
        fseek($fp, $start);
        
        $buffer_size = 8192;
        $bytes_sent = 0;
        
        while (!feof($fp) && $bytes_sent < $length) {
            $remaining = $length - $bytes_sent;
            $buffer = fread($fp, min($buffer_size, $remaining));
            echo $buffer;
            flush();
            $bytes_sent += strlen($buffer);
        }
        
        fclose($fp);
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