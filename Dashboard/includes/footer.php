    </main>
</div> 

<div id="folderModal" class="custom-modal" style="display: none;">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h3>Create New Folder</h3>
            <span class="modal-close">&times;</span>
        </div>
        <div class="custom-modal-body">
            <input type="text" id="folderNameInput" placeholder="Folder name" class="modal-input">
        </div>
        <div class="custom-modal-footer">
            <button class="modal-btn cancel">Cancel</button>
            <button class="modal-btn confirm" id="confirmFolderBtn">Create</button>
        </div>
    </div>
</div>

<div id="uploadModal" class="custom-modal" style="display: none;">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h3>Upload File</h3>
            <span class="modal-close">&times;</span>
        </div>
        <div class="custom-modal-body">
            <div class="extra-margin">
                <label>Select Folder (Optional)</label>
                <select id="uploadFolderSelect" class="modal-select">
                    <option value="">Root (No folder)</option>
                </select>
            </div>
            <div class="extra-margin">
                <label>Choose File</label>
                <input type="file" id="uploadFileInput" class="modal-file-input">
            </div>
        </div>
        <div class="custom-modal-footer">
            <button class="modal-btn cancel">Cancel</button>
            <button class="modal-btn confirm" id="confirmUploadBtn">Upload</button>
        </div>
    </div>
</div>

<script src="/Datahub/assets/js/toast.js"></script>
<script src="/Datahub/assets/js/dashboard.js"></script>
</body>
</html>