<?php

require_once dirname(dirname(__DIR__)) . '/includes/init.php';

session_start();

if (!isset($_SESSION["user_id"])) {
    header("Location: /Datahub/Login.php");
    exit();
}

$username = $_SESSION["username"];  
?>
<!DOCTYPE html>
<html lang="<?= getHtmlLang() ?>" dir="<?= getLangDirection() ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DataHub - <?= __('dashboard') ?></title>

    <link rel="stylesheet" href="/Datahub/assets/fonts/remixicon.css">

    <link rel="stylesheet" href="/Datahub/assets/css/dashboard.css">
</head>
<body>

    <nav class="dashboard-navbar">
        <div class="nav-left">
            <a href="/Datahub/Dashboard/dashboard.php" class="logo">DataHub</a>
        </div>
        <div class="nav-right">
            <div class="user-profile">
                <i class="ri-user-3-line"></i>
                <span><?php echo htmlspecialchars($username); ?></span>
            </div>
            <a href="/Datahub/Dashboard/Logout.php" class="logout-link">
                <i class="ri-logout-box-line"></i> <?= __('logout') ?>
            </a>
        </div>
    </nav>

    <main class="dashboard-main">