

<link rel="stylesheet" href="/Datahub/assets/css/bootstrap.min.css">
<link rel="stylesheet" href="/Datahub/assets/summernote/summernote-bs4.min.css">
<?php
include 'includes/header.php';
?>

<div class="dashboard-content">
    <div id="app">
        <div class="loader-wrapper" id="loader">
            <div class="loader-spinner"></div>
            <p><?= __('loading') ?></p>
        </div>

        <div id="editorMode" style="display: none;">
            <div class="form-group editor-header">
                <input type="text" id="docName" class="doc-name-input" placeholder="<?= __('document_name') ?>">
                <div class="Custom-btn-group">
                    <button class="btn-primary" id="saveBtn"><i class="ri-save-line"></i> <?= __('save') ?></button>
                    <button class="btn-secondary" id="viewToggleBtn"><i class="ri-eye-line"></i> <?= __('view') ?></button>
                </div>
            </div>
            <textarea id="summernote"></textarea>
        </div>

        <div id="viewMode" style="display: none;">
            <div class="view-header">
                <h2 id="viewTitle"></h2>
                <div class="btn-group">
                    <button class="btn-primary" id="editToggleBtn"><i class="ri-edit-line"></i> <?= __('edit') ?></button>
                </div>
            </div>
            <div class="view-content" id="viewContent"></div>
        </div>
    </div>
</div>

<script>
    window.translations = {
        // Documents translations
        'type_here': '<?= __('type_here') ?>'
    };
</script>
<script src="/Datahub/assets/js/jquery-3.7.1.min.js"></script>
<script src="/Datahub/assets/js/bootstrap.min.js"></script>
<script src="/Datahub/assets/summernote/summernote-bs4.min.js"></script>
<script src="/Datahub/assets/summernote/summernote-fa-IR.min.js"></script>
<?php include 'includes/footer.php'; ?>
<script src="/Datahub/assets/js/DocumentActions.js"></script>