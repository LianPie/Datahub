<?php
include 'includes/header.php';
require_once __DIR__ . '/../Database/DbConfig.php';

?>

<div class="dashboard-content">
    <h2><i class="ri-delete-bin-line"></i> <?= __('trash') ?></h2>
    
    <!-- Empty trash button at top -->
    <div id="emptyTrashBtnContainer" style="text-align: right; margin-bottom: 20px;">
        <button class="btn-danger" onclick="emptyTrash()" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
            <i class="ri-delete-bin-2-line"></i> <?= __('empty_trash') ?>
        </button>
    </div>

    <div class="folders-section">
        <h3><i class="ri-folder-line"></i></i> <?= __('folders'); ?></h3>
        <div class="folders-list" id="trashFoldersList">
            <div class="files-grid">
            </div>
            
        </div>
    </div>
    
    <div class="files-section" >
        <h3><i class="ri-file-line"></i></i> <?= __('files'); ?></h3>
        <div id="trashFilesGrid">
            <div class="files-grid">
                <!-- Loader will appear here -->
            </div>
        </div>
    </div>
</div>

<!-- Custom confirmation modal (shared) -->
<div id="confirmModal" class="custom-modal confirm-modal" style="display: none;">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h3 id="confirmTitle">Confirm Action</h3>
            <span class="modal-close" onclick="closeConfirmModal()">&times;</span>
        </div>
        <div class="custom-modal-body">
            <p id="confirmMessage">Are you sure?</p>
        </div>
        <div class="custom-modal-footer">
            <button id="confirmCancelBtn" class="modal-btn cancel">Cancel</button>
            <button id="confirmOkBtn" class="modal-btn confirm">Yes, Proceed</button>
        </div>
    </div>
</div>
<script>
    window.translations = {
        // Trash messages
        'empty_trash': '<?= __('empty_trash') ?>',
        'restore': '<?= __('restore') ?>',
        'delete_permanently': '<?= __('delete_permanently') ?>',
        'trash_empty': '<?= __('trash_empty') ?>',
        'no_items_in_trash': '<?= __('no_items_in_trash') ?>',
        'restore_success': '<?= __('restore_success') ?>',
        'restore_failed': '<?= __('restore_failed') ?>',
        'delete_permanent_success': '<?= __('delete_permanent_success') ?>',
        'delete_permanent_failed': '<?= __('delete_permanent_failed') ?>',
        'empty_trash_success': '<?= __('empty_trash_success') ?>',
        'empty_trash_failed': '<?= __('empty_trash_failed') ?>',
        'confirm_empty_trash': '<?= __('confirm_empty_trash') ?>',
        'confirm_delete_permanent': '<?= __('confirm_delete_permanent') ?>',
        'confirm-restore': '<?= __('confirm-restore') ?>',
        'deleted_at': '<?= __('deleted_at') ?>',
        'original_location': '<?= __('original_location') ?>',
        
};
</script>
<?php include 'includes/footer.php'; ?>
<script src="/Datahub/assets/js/trash.js"></script>