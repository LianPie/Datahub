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
            <button class="modal-btn cancel"><?= __(key: 'cancel') ?></button>
            <button class="modal-btn confirm" id="confirmFolderBtn"><?= __('create') ?></button>
        </div>
    </div>
</div>

<div id="uploadModal" class="custom-modal" style="display: none;">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h3><?= __(key: 'upload_file') ?></h3>
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
            <button class="modal-btn cancel"><?= __(key: 'cancel') ?></button>
            <button class="modal-btn confirm" id="confirmUploadBtn"><?= __(key: 'upload') ?></button>
        </div>
    </div>
</div>

<script src="/Datahub/assets/js/toast.js"></script>
<script src="/Datahub/assets/js/dashboard.js"></script>
<script>
    
function __(key) {
    return window.translations && window.translations[key] ? window.translations[key] : key;
}
</script>
<script src="/Datahub/assets/js/FileManagerCore.js"></script>
<script src="/Datahub/assets/js/FileManagerActions.js"></script>
<script src="/Datahub/assets/js/fileManager.js"></script>

</body>
</html>