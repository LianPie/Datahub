// upload and folder creation 
//TODO: delete 
class FileManagerActions extends FileManagerCore {
    constructor() {
        super();
    }
    
    bindEvents() {
        document.querySelectorAll('.modal-close, .modal-btn.cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        document.getElementById('confirmFolderBtn')?.addEventListener('click', () => this.createFolder());
        document.getElementById('confirmUploadBtn')?.addEventListener('click', () => this.uploadFile());
    }
    
    async createFolder() {
        const folderName = document.getElementById('folderNameInput')?.value;
        if (!folderName || folderName.trim() === '') {
            this.showError('Please enter a folder name');
            return;
        }
        if (!/^[a-zA-Z0-9_\-]+$/.test(folderName)) {
            this.showError('Folder name can only contain letters, numbers, underscores, and hyphens');
            return;
        }
        
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest'},
                body: new URLSearchParams({'action': 'create_folder', 'folder_name': folderName, 'current_path': this.currentPath})
            });
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (data.success) {
                this.showMessage('Folder created successfully', 'success');
                this.closeModals();
                this.loadFolderContents(this.currentPath);
            } else {
                this.showError(data.message);
            }
        } catch(e) {
            this.showError('Failed to create folder');
        }
    }
    
    async uploadFile() {
        const fileInput = document.getElementById('uploadFileInput');
        const folderSelect = document.getElementById('uploadFolderSelect');
        const file = fileInput?.files[0];
        const selectedFolder = folderSelect?.value || '';
        
        let uploadPath = this.currentPath;
        if (selectedFolder) {
            uploadPath = uploadPath ? uploadPath + '/' + selectedFolder : selectedFolder;
        }
        
        if (!file) {
            this.showError('Please select a file');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            this.showError('File too large. Max 50MB');
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'upload_file');
        formData.append('file', file);
        formData.append('subfolder', uploadPath);
        
        const confirmBtn = document.getElementById('confirmUploadBtn');
        const originalText = confirmBtn?.textContent || 'Upload';
        if (confirmBtn) {
            confirmBtn.textContent = 'Uploading...';
            confirmBtn.disabled = true;
        }
        
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                body: formData
            });
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (data.success) {
                this.showMessage(`File uploaded successfully`, 'success');
                this.closeModals();
                
                this.redirectToUploadsPage();
                
                this.loadFolderContents(this.currentPath);
                this.loadStorageInfo();
            } else {
                this.showError(data.message);
            }
        } catch(e) {
            this.showError('Failed to upload file');
        } finally {
            if (confirmBtn) {
                confirmBtn.textContent = originalText;
                confirmBtn.disabled = false;
            }
            if (fileInput) fileInput.value = '';
        }
    }
    
    async loadFolderSelect() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest'},
                body: new URLSearchParams({'action': 'get_folder_contents', 'folder_path': this.currentPath})
            });
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (data.success && data.data.folders) {
                const select = document.getElementById('uploadFolderSelect');
                if (select) {
                    let options = '<option value="">Root (No Folder)</option>';
                    data.data.folders.forEach(folder => {
                        options += `<option value="${folder.name}">📁 ${folder.name}</option>`;
                    });
                    select.innerHTML = options;
                }
            }
        } catch(e) {
            console.error('Failed to load folders', e);
        }
    }
    
    async deleteItem(itemPath, isFolder) {
        if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`)) return;
        
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest'},
                body: new URLSearchParams({'action': 'delete_item', 'item_path': itemPath, 'is_folder': isFolder ? '1' : '0'})
            });
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (data.success) {
                this.showMessage(`${isFolder ? 'Folder' : 'File'} deleted successfully`, 'success');
                this.loadFolderContents(this.currentPath);
                this.loadStorageInfo();
            } else {
                this.showError(data.message);
            }
        } catch(e) {
            this.showError('Failed to delete');
        }
    }
    
    previewFile(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const previewUrl = `${this.baseUrl}?download=1&path=${encodeURIComponent(filePath)}`;
    
    // تصاویر
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
    
    // ویدیوها
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg'];
    
    // موزیک / صدا
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus'];
    
    // PDF
    const pdfExts = ['pdf'];
    
    // ========== نمایش تصویر ==========
    if (imageExts.includes(ext)) {
        const previewModal = document.createElement('div');
        previewModal.className = 'custom-modal';
        previewModal.style.display = 'flex';
        previewModal.innerHTML = `
            <div class="custom-modal-content" style="max-width: 90%; max-height: 90%;">
                <div class="custom-modal-header">
                    <h3>Image Preview</h3>
                    <span class="modal-close" onclick="this.closest('.custom-modal').remove()">&times;</span>
                </div>
                <div class="custom-modal-body" style="text-align: center;">
                    <img src="${previewUrl}" style="max-width: 100%; max-height: 70vh;">
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);
        previewModal.addEventListener('click', (e) => { 
            if (e.target === previewModal) previewModal.remove(); 
        });
    }
    
    // ========== نمایش ویدیو ==========
    else if (videoExts.includes(ext)) {
        const previewModal = document.createElement('div');
        previewModal.className = 'custom-modal';
        previewModal.style.display = 'flex';
        previewModal.innerHTML = `
            <div class="custom-modal-content" style="max-width: 90%; max-height: 90%;">
                <div class="custom-modal-header">
                    <h3>Video Player</h3>
                    <span class="modal-close" onclick="this.closest('.custom-modal').remove()">&times;</span>
                </div>
                <div class="custom-modal-body" style="text-align: center;">
                    <video controls autoplay style="max-width: 100%; max-height: 70vh;">
                        <source src="${previewUrl}" type="video/${ext === 'mp4' ? 'mp4' : ext === 'webm' ? 'webm' : 'ogg'}">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);
        previewModal.addEventListener('click', (e) => { 
            if (e.target === previewModal) previewModal.remove(); 
        });
    }
    
    // ========== پخش موزیک ==========
    else if (audioExts.includes(ext)) {
        const previewModal = document.createElement('div');
        previewModal.className = 'custom-modal';
        previewModal.style.display = 'flex';
        previewModal.innerHTML = `
            <div class="custom-modal-content" style="max-width: 500px;">
                <div class="custom-modal-header">
                    <h3>Music Player</h3>
                    <span class="modal-close" onclick="this.closest('.custom-modal').remove()">&times;</span>
                </div>
                <div class="custom-modal-body" style="text-align: center; padding: 20px;">
                    <i class="ri-music-fill" style="font-size: 80px; color: #6c757d;"></i>
                    <p><strong>${this.escapeHtml(filePath.split('/').pop())}</strong></p>
                    <audio controls autoplay style="width: 100%;">
                        <source src="${previewUrl}" type="audio/${ext === 'mp3' ? 'mpeg' : ext === 'wav' ? 'wav' : 'ogg'}">
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);
        previewModal.addEventListener('click', (e) => { 
            if (e.target === previewModal) previewModal.remove(); 
        });
    }
    
    // ========== نمایش PDF ==========
    else if (pdfExts.includes(ext)) {
        const previewModal = document.createElement('div');
        previewModal.className = 'custom-modal';
        previewModal.style.display = 'flex';
        previewModal.innerHTML = `
            <div class="custom-modal-content" style="max-width: 90%; max-height: 90%;">
                <div class="custom-modal-header">
                    <h3>PDF Preview</h3>
                    <span class="modal-close" onclick="this.closest('.custom-modal').remove()">&times;</span>
                </div>
                <div class="custom-modal-body" style="text-align: center;">
                    <iframe src="${previewUrl}" style="width: 100%; height: 70vh;" frameborder="0"></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);
        previewModal.addEventListener('click', (e) => { 
            if (e.target === previewModal) previewModal.remove(); 
        });
    }
    
    // ========== بقیه فایل‌ها: دانلود مستقیم ==========
    else {
        if (confirm('This file type cannot be previewed. Do you want to download it?')) {
            window.location.href = `${this.baseUrl}?download=1&path=${encodeURIComponent(filePath)}`;
        }
    }
}
    
    shareFile(filePath) {
        const shareUrl = `${window.location.origin}/Datahub/share.php?file=${encodeURIComponent(filePath)}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showMessage('Share link copied to clipboard!', 'success');
        }).catch(() => {
            prompt('Copy this link:', shareUrl);
        });
    }
    
    closeModals() {
        document.querySelectorAll('.custom-modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}