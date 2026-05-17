<?php
include 'Includes/header.php';

$current_username = $_SESSION['username'] ?? '';
$current_email = $_SESSION['email'] ?? '';
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

<script>
    window.translations = {
        // Profile page translations
        'updating': '<?= __('updating') ?>',
        'current_password_required': '<?= __('current_password_required') ?>',
        'new_password_required': '<?= __('new_password_required') ?>',
        'passwords_match': '<?= __('passwords_match') ?>',
        'password_weak': '<?= __('password_weak') ?>',
        'password_medium': '<?= __('password_medium') ?>',
        'password_strong': '<?= __('password_strong') ?>',
        'password_too_short': '<?= __('password_too_short') ?>',
        'passwords_do_not_match': '<?= __('passwords_do_not_match') ?>',
        'same_as_current': '<?= __('same_as_current') ?>',
        'connection_error': '<?= __('connection_error') ?>',
        
        // Handler response messages
        'username_exists': '<?= __('username_exists') ?>',
        'username_length': '<?= __('username_length') ?>',
        'username_invalid': '<?= __('username_invalid') ?>',
        'username_updated': '<?= __('username_updated') ?>',
        'password_updated': '<?= __('password_updated') ?>',
        'wrong_password': '<?= __('wrong_password') ?>',
        'all_fields_required': '<?= __('all_fields_required') ?>',
        'user_not_found': '<?= __('user_not_found') ?>',
        'database_error': '<?= __('database_error') ?>',
        'update_failed': '<?= __('update_failed') ?>',
        'username_required': '<?= __('username_required') ?>'
    };
    
function __(key) {
    return window.translations && window.translations[key] ? window.translations[key] : key;
}
</script>

<?php include 'Includes/footer.php'; ?>

<script src="/Datahub/assets/js/profile.js"></script>