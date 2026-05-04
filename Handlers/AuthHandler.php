<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
include __DIR__ . '/../Database/DbConfig.php';

function handleLogin($email, $password, $conn) {
    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user["password"])) {
            $_SESSION["user_id"] = $user["id"];
            $_SESSION["username"] = $user["username"];
            return ["success" => true, "message" => "Login successful"];
        } else {
            return ["success" => false, "message" => "Wrong password"];
        }
    } else {
        return ["success" => false, "message" => "User not found"];
    }
}

function handleRegister($username, $email, $password, $conn) {
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $username, $email, $hashed);

    if ($stmt->execute()) {
        return ["success" => true, "message" => "Registration successful"];
    } else {
        return ["success" => false, "message" => "Registration failed: " . $conn->error];
    }
}

function checkEmailExists($email, $conn) {
    $sql = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->num_rows > 0;
}



if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    header('Content-Type: application/json');
    
    $action = $_POST["action"] ?? '';
    $response = ["success" => false, "message" => "Invalid action"];
    
    if ($action === "login") {
        $email = trim($_POST["email"] ?? '');
        $password = trim($_POST["password"] ?? '');
        $response = handleLogin($email, $password, $conn);
    } elseif ($action === "register") {
        $username = trim($_POST["username"] ?? '');
        $email = trim($_POST["email"] ?? '');
        $password = trim($_POST["password"] ?? '');
        $response = handleRegister($username, $email, $password, $conn);
    } elseif ($action === "check_email") {  
        $email = trim($_POST["email"] ?? '');
        $exists = checkEmailExists($email, $conn);
        $response = ["success" => true, "exists" => $exists];
    }
    
    echo json_encode($response);
    exit();
}
?>