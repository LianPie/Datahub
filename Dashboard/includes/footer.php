    </main>
</div> 

<div id="folderModal" class="custom-modal" style="display: none;">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h3><?= __('create_new_folder') ?></h3>
            <span class="modal-close">&times;</span>
        </div>
        <div class="custom-modal-body">
            <input type="text" id="folderNameInput" placeholder="<?= __('folder_name') ?>" class="modal-input">
        </div>
        <div class="custom-modal-footer">
            <button class="modal-btn cancel"><?= __('cancel') ?></button>
            <button class="modal-btn confirm" id="confirmFolderBtn"><?= __('create') ?></button>
        </div>
    </div>
</div>

<div id="uploadModal" class="custom-modal" style="display: none;">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h3><?= __('upload_file') ?></h3>
            <span class="modal-close">&times;</span>
        </div>
        <div class="custom-modal-body">
            <div class="extra-margin">
                <label><?= __('select_folder_optional') ?></label>
                <select id="uploadFolderSelect" class="modal-select">
                    <option value=""><?= __('root_no_folder') ?></option>
                </select>
            </div>
            <div class="extra-margin">
                <label><?= __('choose_file') ?></label>
                <input type="file" id="uploadFileInput" class="modal-file-input">
            </div>
        </div>
        <div class="custom-modal-footer">
            <button class="modal-btn cancel"><?= __('cancel') ?></button>
            <button class="modal-btn confirm" id="confirmUploadBtn"><?= __('upload') ?></button>
        </div>
    </div>
</div>

<script src="/Datahub/assets/js/toast.js"></script>
<script src="/Datahub/assets/js/dashboard.js"></script>
<script>
      const generalTranslations = {
        'lan': '<?= $lang ?>',
        'error_loading_files': '<?= __('error_loading_files') ?>',
        'no_folders_yet': '<?= __('no_folders_yet') ?>',
        'no_files_yet': '<?= __('no_files_yet') ?>',
        'root': '<?= __('root') ?>',
        'location_in': '<?= __('location_in') ?>',
        'all_files_folders': '<?= __('all_files_folders') ?>',
        'loading': '<?= __('loading') ?>',
        'error_loading_image': '<?= __('error_loading_image') ?>',
        'error_loading_video': '<?= __('error_loading_video') ?>',
        'error_loading_audio': '<?= __('error_loading_audio') ?>',
        'error_loading_folders': '<?= __('error_loading_folders') ?>',
        'root_no_folder': '<?= __('root_no_folder') ?>',
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
        'failed_to_load_folders': '<?= __('failed_to_load_folders') ?>',
    };

    if (window.translations) {
        window.translations = { ...window.translations, ...generalTranslations };
    } else {
        window.translations = generalTranslations;
    }

function __(key) {
    return window.translations && window.translations[key] ? window.translations[key] : key;
}
</script>
<script src="/Datahub/assets/js/FileManagerCore.js"></script>
<script src="/Datahub/assets/js/FileManagerActions.js"></script>
<script src="/Datahub/assets/js/fileManager.js"></script>

</body>
</html>