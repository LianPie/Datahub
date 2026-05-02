<?php
session_start();
if (!isset($_SESSION["user_id"])) {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Datahub</title>
    <link rel="stylesheet" href="/Datahub/assets/css/LoginStyles.css">
</head>
<body>
    <div class="container" style="text-align:center; margin-top:50px;">
        <h1>Welcome <?php echo $_SESSION["username"] ?></h1>
        <p>Your cloud storage is ready!</p>
        <a href="logout.php">Logout</a>
    </div>
</body>
</html>