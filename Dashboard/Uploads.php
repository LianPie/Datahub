<?php
include 'includes/header.php';
?>

<div class="dashboard-content">
    <h2><?= __('all_files_folders'); ?></h2>

    <div class="folders-section">
        <h3><i class="ri-folder-line"></i></i> <?= __('folders'); ?></h3>
        <div class="folders-list">
            
                    <div class="folder-card" data-folder-id=">">
                        <i class="ri-folder-line"></i>
                        <span class="folder-name"></span>
                        <!-- <small><?= __('date'); ?></small> -->
                    </div>
        </div>
    </div>

    <div class="files-section">
        <h3><i class="ri-file-line"></i></i> <?= __('files'); ?></h3>
        <div class="files-grid">

                    <div class="file-card">
                        <div class="file-icon">
                        </div>
                        <div class="file-name"></div>
                        <div class="file-size">X KB</div>
                            <div class="file-folder"><small><?= __('in'); ?> "<?= __('folder_name_placeholder'); ?></small></div>
                        <div class="file-actions">
                            <button class="preview-btn" data-path="" data-type=""><i class="ri-eye-line"></i></button>
                            <a href="" download><i class="ri-download-line"></i></a>
                            <button class="delete-btn" data-id=""><i class="ri-delete-bin-line"></i></button>
                            <button class="share-btn" data-id=""><i class="ri-share-line"></i></button>
                        </div>
                    </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>