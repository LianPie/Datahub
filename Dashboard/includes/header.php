<?php

require_once dirname(dirname(__DIR__)) . '/includes/init.php';

// session_start();

if (!isset($_SESSION["user_id"])) {
    header("Location: /Datahub/Login.php");
    exit();
}
$lang = getHtmlLang();
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
            <i class="ri-folder-add-line"></i><span class="btn-text"><?= __('new_folder') ?></span>
        </button>
        <button type="button" class="btn-custom" id="uploadFileBtn">
            <i class="ri-upload-line"></i><span class="btn-text"><?= __('upload') ?></span>
        </button>

        <div class="user-profile">
            <i class="ri-user-3-line"></i>
            <span><?php echo htmlspecialchars($username); ?></span>
        </div>
        <?php if ($current_lang == 'en'): ?>
            <a href="?lang=fa" type="button" class="btn-lang" id="switchLangBtn">فا</a>
        <?php else: ?>
            <a href="?lang=en" type="button" class="btn-lang" id="switchLangBtn">en</a>
        <?php endif; ?>

    </div>
</nav>

<div class="dashboard-wrapper">

    <aside class="dashboard-sidebar">
        <ul class="sidebar-nav">
            <li>
                <a href="/Datahub/Dashboard/index.php" >
                    <i class="ri-dashboard-line"></i> <span><?= __('dashboard') ?></span>
                </a>
            </li>
            <li>
                <a href="/Datahub/Dashboard/Uploads.php" >
                    <i class="ri-folder-line"></i> <span><?= __(key: 'files') ?></span>
                </a>
            </li>
            <li>
                <a href="#" >
                    <i class="ri-delete-bin-line"></i> <span><?= __(key: 'trash') ?></span>
                </a>
            </li>
            <li>
                <a href="/Datahub/Dashboard/Profile.php" >
                    <i class="ri-settings-line"></i> <span><?= __('settings') ?></span>
                </a>
            </li>
            <li>
                <a href="/Datahub/Dashboard/Logout.php">
                    <i class="ri-logout-box-line"></i> <span><?= __('logout') ?></span>
                </a>
            </li>
        </ul>
    </aside>


    <main class="dashboard-main">