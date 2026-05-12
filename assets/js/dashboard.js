
const folderModal = document.getElementById('folderModal');
const uploadModal = document.getElementById('uploadModal');
const newFolderBtn = document.getElementById('newFolderBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const closeBtns = document.querySelectorAll('.modal-close, .modal-btn.cancel');

function openModal(modal) {
    modal.style.display = 'flex';
}
function closeModal(modal) {
    modal.style.display = 'none';
}

closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        folderModal.style.display = 'none';
        uploadModal.style.display = 'none';
    });
});
window.addEventListener('click', (e) => {
    if (e.target === folderModal) folderModal.style.display = 'none';
    if (e.target === uploadModal) uploadModal.style.display = 'none';
});
if (newFolderBtn) newFolderBtn.addEventListener('click', () => openModal(folderModal));
if (uploadFileBtn) uploadFileBtn.addEventListener('click', () => openModal(uploadModal));

const confirmFolderBtn = document.getElementById('confirmFolderBtn');
if (confirmFolderBtn) {
    confirmFolderBtn.addEventListener('click', async function() {
        const folderName = document.getElementById('folderNameInput').value.trim();
        if (!folderName) {
            if (typeof showToast === 'function') showToast('Folder name is required', 'error');
            return;
        }
        try {
            const response = await fetch('/Datahub/Handlers/create_folder.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'folder_name=' + encodeURIComponent(folderName)
            });
            const data = await response.json();
            if (data.success) {
                if (typeof showToast === 'function') showToast('Folder created successfully', 'success');
                closeModal(folderModal);
                location.reload();
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'Error creating folder', 'error');
            }
        } catch (err) {
            if (typeof showToast === 'function') showToast('Network error', 'error');
        }
    });
}

// آپلود فایل
const confirmUploadBtn = document.getElementById('confirmUploadBtn');
if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener('click', async function() {
        const fileInput = document.getElementById('uploadFileInput');
        const folderId = document.getElementById('uploadFolderSelect').value;
        if (!fileInput.files.length) {
            if (typeof showToast === 'function') showToast('Please select a file', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        if (folderId) formData.append('folder_id', folderId);

        try {
            const response = await fetch('/Datahub/Handlers/upload_file.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                if (typeof showToast === 'function') showToast('File uploaded successfully', 'success');
                closeModal(uploadModal);
                location.reload();
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'Upload failed', 'error');
            }
        } catch (err) {
            if (typeof showToast === 'function') showToast('Network error', 'error');
        }
    });
}