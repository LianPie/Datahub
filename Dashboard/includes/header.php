<?php
session_start();

if (!isset($_SESSION["user_id"])) {
    header("Location: /Datahub/Login.php");
    exit();
}

$username = $_SESSION["username"];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DataHub - Dashboard</title>
    <link rel="stylesheet" href="/Datahub/assets/fonts/remixicon.css">
    <link rel="stylesheet" href="/Datahub/assets/css/dashboard.css">
    <link rel="stylesheet" href="/Datahub/assets/css/toast.css">
</head>
<body>

<nav class="dashboard-navbar">
    <div class="nav-left">
        <img src="/Datahub/assets/img/cloud-icon.png" alt="DataHub Logo" style="height: 40px; width: auto;">
        <a href="/Datahub/Dashboard/index.php" class="logo">DataHub</a>
    </div>
    <div class="nav-right">
        <button type="button" class="btn-custom" id="newFolderBtn">
            <i class="ri-folder-add-line"></i><span class="btn-text">New Folder</span>
        </button>
        <button type="button" class="btn-custom" id="uploadFileBtn">
            <i class="ri-upload-line"></i><span class="btn-text">Upload</span>
        </button>

        <div class="user-profile">
            <i class="ri-user-3-line"></i>
            <span><?php echo htmlspecialchars($username); ?></span>
        </div>

    </div>
</nav>

<div class="dashboard-wrapper">

    <aside class="dashboard-sidebar">
        <ul class="sidebar-nav">
            <li>
                <a href="/Datahub/Dashboard/index.php" >
                    <i class="ri-dashboard-line"></i> <span>Dashboard</span>
                </a>
            </li>
            <li>
                <a href="#" >
                    <i class="ri-folder-line"></i> <span>Files</span>
                </a>
            </li>
            <li>
                <a href="#" >
                    <i class="ri-delete-bin-line"></i> <span>Trash</span>
                </a>
            </li>
            <li>
                <a href="#" >
                    <i class="ri-settings-line"></i> <span>Settings</span>
                </a>
            </li>
            <li>
                <a href="/Datahub/Dashboard/Logout.php">
                    <i class="ri-logout-box-line"></i> <span>Logout</span>
                </a>
            </li>
        </ul>
    </aside>


    <main class="dashboard-main">