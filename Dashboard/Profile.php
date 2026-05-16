<?php
include 'Includes/header.php';

$current_username = $_SESSION['username'] ?? '';
$current_email = $_SESSION['user_email'] ?? '';
?>
<div class="profile-container">
    <div id="messageBox" style="margin-bottom: 1.5rem;"></div>

    <!-- Card 1: Account Information -->
    <div class="profile-card">
        <h3><i class="ri-user-settings-line"></i> <?= __('account_information') ?></h3>
        <form id="infoForm" method="POST" action="/Datahub/Handlers/update_username.php">
            <div class="form-group">
                <label><?= __('username') ?></label>
                <input type="text" name="username" value="<?= htmlspecialchars($current_username); ?>" required>
            </div>
            <div class="form-group">
                <label><?= __('email') ?></label>
                <input type="email" value="<?= htmlspecialchars($current_email); ?>" readonly disabled>
                <span class="form-note"><?= __('email_cannot_be_changed') ?></span>
            </div>
            <button type="submit" class="btn-primary"><i class="ri-save-line"></i> <?= __('update_username') ?></button>
        </form>
    </div>

    <!-- Card 2: Change Password -->
    <div class="profile-card">
        <h3><i class="ri-lock-password-line"></i> <?= __('change_password') ?></h3>
        <form id="passwordForm" method="POST" action="/Datahub/Handlers/update_password.php">
            <div class="form-group">
                <label><?= __('current_password') ?></label>
                <input type="password" name="current_password" required>
            </div>
            <div class="form-group">
                <label><?= __('new_password') ?></label>
                <input type="password" name="new_password">
            </div>
            <div class="form-group">
                <label><?= __('confirm_new_password') ?></label>
                <input type="password" name="confirm_password">
            </div>
            <button type="submit" class="btn-primary"><i class="ri-key-line"></i> <?= __('change_password_btn') ?></button>
        </form>
    </div>
</div>


<?php include 'Includes/footer.php'; ?>