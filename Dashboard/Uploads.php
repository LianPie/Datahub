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

<script>
    window.translations = {
    // File manager messages
    'error_loading_files': '<?= __('error_loading_files') ?>',
    'no_folders_yet': '<?= __('no_folders_yet') ?>',
    'no_files_yet': '<?= __('no_files_yet') ?>',
    'root': '<?= __('root') ?>',
    'location_in': '<?= __('location_in') ?>',
    'all_files_folders': '<?= __('all_files_folders') ?>',
    'please_enter_folder_name': '<?= __('please_enter_folder_name') ?>',
    'invalid_folder_name': '<?= __('invalid_folder_name') ?>',
    'folder_created_success': '<?= __('folder_created_success') ?>',
    'failed_to_create_folder': '<?= __('failed_to_create_folder') ?>',
    'please_select_file': '<?= __('please_select_file') ?>',
    'file_too_large': '<?= __('file_too_large') ?>',
    'uploading': '<?= __('uploading') ?>',
    'file_uploaded_success': '<?= __('file_uploaded_success') ?>',
    'failed_to_upload_file': '<?= __('failed_to_upload_file') ?>',
    'root_no_folder': '<?= __('root_no_folder') ?>',
    'failed_to_load_folders': '<?= __('failed_to_load_folders') ?>',
    'image_preview': '<?= __('image_preview') ?>',
    'video_player': '<?= __('video_player') ?>',
    'browser_no_video_support': '<?= __('browser_no_video_support') ?>',
    'music_player': '<?= __('music_player') ?>',
    'browser_no_audio_support': '<?= __('browser_no_audio_support') ?>',
    'pdf_preview': '<?= __('pdf_preview') ?>',
    'cannot_preview_download': '<?= __('cannot_preview_download') ?>'
};
function __(key) {
    return window.translations && window.translations[key] ? window.translations[key] : key;
}
</script>
<?php include 'includes/footer.php'; ?>