<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../Database/DbConfig.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
    exit();
}


$user_id = $_SESSION["user_id"];

//Change Username
function ChangeUsername($user_id, $User_name, $conn) {
    
    $check_sql = "SELECT id FROM users WHERE username = ? AND id != ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("si", $User_name, $user_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        return ["success" => false, "message" => "username_exists"];
    }
    
    if (strlen($User_name) < 3 || strlen($User_name) > 50) {
        return ["success" => false, "message" => "username_length"];
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $User_name)) {
        return ["success" => false, "message" => "username_invalid"];
    }
    
    $sql = "UPDATE users SET username = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return ["success" => false, "message" => "database_error"];
    }
    
    $stmt->bind_param("si", $User_name, $user_id);
    
    if ($stmt->execute()) {
        $_SESSION["username"] = $User_name;
        return ["success" => true, "message" => "username_updated"];
    } else {
        return ["success" => false, "message" => "update_failed"];
    }

}


//Change password
function ChangePassword($user_id, $Current_Pass, $New_Pass, $conn) {
    
   // Validate new password 
    if (strlen($New_Pass) < 8) {
        return ["success" => false, "message" => "password_too_short"];
    }
    if (!preg_match('/[A-Z]/', $New_Pass) || !preg_match('/[a-z]/', $New_Pass) || !preg_match('/\d/', $New_Pass)) {
        return ["success" => false, "message" => "password_weak"];
    }
    
    $sql = "SELECT password FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return ["success" => false, "message" => "database_error"];
    }
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return ["success" => false, "message" => "user_not_found"];
    }
    
    $user = $result->fetch_assoc();
    
    if (!password_verify($Current_Pass, $user["password"])) {
        return ["success" => false, "message" => "wrong_password"];
    }
    
    if (password_verify($New_Pass, $user["password"])) {
        return ["success" => false, "message" => "same_as_old"];
    }
    
    $hashed = password_hash($New_Pass, PASSWORD_DEFAULT);
    
    $update_sql = "UPDATE users SET password = ? WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);
    if (!$update_stmt) {
        return ["success" => false, "message" => "database_error"];
    }
    
    $update_stmt->bind_param("si", $hashed, $user_id);
    
    if ($update_stmt->execute()) {
        return ["success" => true, "message" => "password_updated"];
    } else {
        return ["success" => false, "message" => "update_failed"];
    }
}



if ($_SERVER["REQUEST_METHOD"] == "POST" && 
    isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    
    header('Content-Type: application/json');
    $action = $_POST["action"] ?? '';
    
    
    switch ($action) {
        case 'Change_Username':
            
            $User_name = trim($_POST["username"] ?? '');
            
            if (empty($User_name)) {
                $response = ["success" => false, "message" => "username_required"];
            } 
            else {
                $response = ChangeUsername($user_id, $User_name, $conn);
            }
            break;
            
        case 'Change_Password':
             $Current_Pass = $_POST["current_password"] ?? '';
            $New_Pass = $_POST["new_password"] ?? '';
            $Confirm_Pass = $_POST["confirm_new_password"] ?? '';
            
            if (empty($Current_Pass) || empty($New_Pass) || empty($Confirm_Pass)) {
                $response = ["success" => false, "message" => "all_fields_required"];
            }
            else if ($New_Pass !== $Confirm_Pass) {
                $response = ["success" => false, "message" => "passwords_do_not_match"];
            }
            else if ($Current_Pass === $New_Pass) {
                $response = ["success" => false, "message" => "same_as_current"];
            } else {
                $response = ChangePassword($user_id, $Current_Pass, $New_Pass, $conn);
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
?>