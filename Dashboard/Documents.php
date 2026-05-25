<?php
include 'includes/header.php';
?>

<div class="dashboard-content">
    <h2><?= __('all_files_folders'); ?></h2>


    <!-- Documents Section -->
    <div class="documents-section" style="margin-top: 40px;">
        <h3><i class="ri-file-text-line"></i> <?= __('docs'); ?></h3>
        <div class="documents-grid" id="documentsGrid">
            <div class="loader-container" style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                <div class="loader-spinner"></div>
                <span style="margin-left: 10px;"><?= __('loading'); ?>...</span>
            </div>
        </div>
    </div>
</div>

<script>
    window.translations = {
        // Documents translations
        'loading_documents': '<?= __('loading_documents') ?>',
        'error_loading_documents': '<?= __('error_loading_documents') ?>',
        'no_documents_yet': '<?= __('no_documents_yet') ?>',
        'create_first_document': '<?= __('create_first_document') ?>',
        'unknown_date': '<?= __('unknown_date') ?>',
        'view': '<?= __('view') ?>',
        'edit': '<?= __('edit') ?>',
        'delete': '<?= __('delete') ?>',
        'new_document': '<?= __('new_document') ?>',
        'enter_document_name': '<?= __('enter_document_name') ?>',
        'confirm_delete_document': '<?= __('confirm_delete_document') ?>',
        'error_deleting_document': '<?= __('error_deleting_document') ?>',
        'create_document': '<?= __('create_document') ?>',
        'edit_document': '<?= __('edit_document') ?>',
        'document_created': '<?= __('document_created') ?>',
        'document_updated': '<?= __('document_updated') ?>',
        'document_deleted': '<?= __('document_deleted') ?>',
        'confirm_delete_file': '<?= __('confirm_delete_file') ?>'
    };
</script>
<?php include 'includes/footer.php'; ?>
<script src="/Datahub/assets/js/Documents.js"></script>