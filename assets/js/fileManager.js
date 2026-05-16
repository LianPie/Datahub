// FileManager Class for your UI
class FileManager {
    constructor() {
        this.currentPath = '';
        this.baseUrl = '/Datahub/Handlers/UploadHandler.php';
        this.init();
    }
    
    init() {
        this.loadFolderContents();
        this.bindEvents();
        this.loadStorageInfo();
        this.loadFolderSelect(); // For upload modal dropdown
    }
    
    bindEvents() {
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-btn.cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // Confirm buttons
        document.getElementById('confirmFolderBtn')?.addEventListener('click', () => this.createFolder());
        document.getElementById('confirmUploadBtn')?.addEventListener('click', () => this.uploadFile());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('custom-modal')) {
                this.closeModals();
            }
        });
    }
    
    // ============ LOAD FILES AND FOLDERS (Root or Current Path) ============
    loadFolderContents(path = '') {
        this.currentPath = path;
        
        fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                'action': 'get_folder_contents',
                'folder_path': this.currentPath
            })
        })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    console.log(this.currentPath)
                    console.log(data.data)
                    this.renderUI(data.data);
                } else {
                    this.showError(data.message);
                }
            } catch(e) {
                console.error('Invalid JSON:', text);
                this.showError('Failed to load files');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showError('Connection error');
        });
    }
    
    // ============ RENDER YOUR UI ============
    renderUI(data) {
        // Render Folders
        this.renderFolders(data.folders || []);
        
        // Render Files
        this.renderFiles(data.files || []);
    }
    
    renderFolders(folders) {
        const foldersList = document.querySelector('.folders-list');
        if (!foldersList) return;
        
        if (folders.length === 0) {
            foldersList.innerHTML = '<div class="empty-message">No folders yet</div>';
            return;
        }
        
        let html = '';
        folders.forEach(folder => {
            const folderName = folder.name;
            const folderPath = folder.path;
            const createdDate = folder.modified || new Date().toISOString().split('T')[0];
            
            html += `
                <div class="folder-card" onclick="fileManager.openFolder('${folderPath}')" style="cursor: pointer;">
                    <i class="ri-folder-line"></i>
                    <span class="folder-name">${this.escapeHtml(folderName)}</span>
                    <small>${createdDate}</small>
                </div>
            `;
        });
        
        foldersList.innerHTML = html;
    }
    
    renderFiles(files) {
        const filesGrid = document.querySelector('.files-grid');
        if (!filesGrid) return;
        
        if (files.length === 0) {
            filesGrid.innerHTML = '<div class="empty-message">No files yet</div>';
            return;
        }
        
        let html = '';
        files.forEach(file => {
            const icon = this.getFileIcon(file.name);
            const fileSize = file.size_formatted || this.formatBytes(file.size);
            const folderName = this.currentPath || 'Root';
            
            html += `
                <div class="file-card">
                    <div class="file-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="file-name">${this.escapeHtml(file.name)}</div>
                    <div class="file-size">${fileSize}</div>
                    <div class="file-folder">
                        <small>in "${this.escapeHtml(folderName)}"</small>
                    </div>
                    <div class="file-actions">
                        <button class="preview-btn" onclick="fileManager.previewFile('${file.path}')" data-path="${file.path}" data-type="${file.extension || ''}">
                            <i class="ri-eye-line"></i>
                        </button>
                        <a href="${this.baseUrl}?download=1&path=${encodeURIComponent(file.path)}" download>
                            <i class="ri-download-line"></i>
                        </a>
                        <button class="delete-btn" onclick="fileManager.deleteItem('${file.path}', false)">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                        <button class="share-btn" onclick="fileManager.shareFile('${file.path}')">
                            <i class="ri-share-line"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        filesGrid.innerHTML = html;
    }
    
    // ============ OPEN FOLDER (Click on folder) ============
    openFolder(folderPath) {
        this.loadFolderContents(folderPath);
        
        // Update page title or breadcrumb
        const pageTitle = document.querySelector('.dashboard-content h2');
        if (pageTitle) {
            const folderName = folderPath.split('/').pop();
            pageTitle.innerHTML = `${this.escapeHtml(folderName)} <i class="ri-folder-line"></i>`;
            
            // Add back button if not in root
            if (!pageTitle.querySelector('.back-btn')) {
                const backBtn = document.createElement('button');
                backBtn.innerHTML = '← Back';
                backBtn.className = 'back-btn';
                backBtn.onclick = () => this.goBack();
                backBtn.style.marginLeft = '10px';
                pageTitle.appendChild(backBtn);
            }
        }
    }
    goBack() {
        if (!this.currentPath) return;
        
        // Split path and remove last part
        const pathParts = this.currentPath.split('/');
        pathParts.pop(); // Remove last folder
        const parentPath = pathParts.join('/');
        
        // Load parent folder contents
        this.loadFolderContents(parentPath);
        
        // Update page title
        const pageTitle = document.querySelector('.dashboard-content h2');
        if (pageTitle) {
            if (parentPath) {
                const folderName = parentPath.split('/').pop();
                pageTitle.innerHTML = `${this.escapeHtml(folderName)} <i class="ri-folder-line"></i>`;
                
                // Keep back button if not root
                if (!pageTitle.querySelector('.back-btn')) {
                    const backBtn = document.createElement('button');
                    backBtn.innerHTML = '← Back';
                    backBtn.className = 'back-btn';
                    backBtn.onclick = () => this.goBack();
                    backBtn.style.marginLeft = '10px';
                    pageTitle.appendChild(backBtn);
                }
            } else {
                pageTitle.innerHTML = 'All Files & Folders';
                const backBtn = pageTitle.querySelector('.back-btn');
                if (backBtn) backBtn.remove();
            }
        }
    }

    openFolder(folderPath) {
        this.loadFolderContents(folderPath);
        
        // Update page title with folder name
        const pageTitle = document.querySelector('.dashboard-content h2');
        if (pageTitle) {
            const folderName = folderPath.split('/').pop();
            pageTitle.innerHTML = `${this.escapeHtml(folderName)} <i class="ri-folder-line"></i> `;
            
            // Add back button if not already there
            if (!pageTitle.querySelector('.back-btn')) {
                const backBtn = document.createElement('button');
                backBtn.innerHTML = '← Back';
                backBtn.className = 'back-btn';
                backBtn.onclick = () => this.goBack();
                backBtn.style.marginLeft = '10px';
                pageTitle.appendChild(backBtn);
            }
        }
    }
    // ============ CREATE FOLDER ============
    createFolder() {
        const folderName = document.getElementById('folderNameInput').value;
        
        if (!folderName || folderName.trim() === '') {
            this.showError('Please enter a folder name');
            return;
        }
        
        // Validate folder name
        if (!/^[a-zA-Z0-9_\-]+$/.test(folderName)) {
            this.showError('Folder name can only contain letters, numbers, underscores, and hyphens');
            return;
        }
        
        fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                'action': 'create_folder',
                'folder_name': folderName,
                'current_path': this.currentPath
            })
        })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    this.showMessage('Folder created successfully', 'success');
                    this.closeModals();
                    this.loadFolderContents(this.currentPath);
                } else {
                    this.showError(data.message);
                }
            } catch(e) {
                console.error('Invalid JSON:', text);
                this.showError('Failed to create folder');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showError('Connection error');
        });
    }
    
    // ============ UPLOAD FILE ============
    loadFolderSelect() {
        fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                'action': 'get_folder_contents',  // ← Use existing action
                'folder_path': this.currentPath
            })
        })
        .then(response => response.text())
        .then(text => {
            try {
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
        });
    }

    uploadFile() {
        const fileInput = document.getElementById('uploadFileInput');
        const folderSelect = document.getElementById('uploadFolderSelect');
        const file = fileInput.files[0];
        
        // Get selected folder from dropdown
        const selectedFolder = folderSelect.value;
        
        // Build the correct path
        let uploadPath = this.currentPath;
        if (selectedFolder) {
            // If a folder is selected, append it to current path
            uploadPath = uploadPath ? uploadPath + '/' + selectedFolder : selectedFolder;
        }

        if (!file) {
            this.showError('Please select a file');
            return;
        }
        
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            this.showError('File too large. Max 50MB');
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'upload_file');
        formData.append('file', file);
        formData.append('subfolder', uploadPath);  // ← Use the combined path
        
        // Show loading on confirm button
        const confirmBtn = document.getElementById('confirmUploadBtn');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Uploading...';
        confirmBtn.disabled = true;
        
        fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    this.showMessage(`File "${file.name}" uploaded successfully`, 'success');
                    this.closeModals();
                    this.loadFolderContents(this.currentPath);
                    this.loadStorageInfo();
                } else {
                    this.showError(data.message);
                }
            } catch(e) {
                console.error('Invalid JSON:', text);
                this.showError('Failed to upload file');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showError('Connection error');
        })
        .finally(() => {
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
            fileInput.value = '';
        });
    }
        
    // ============ STORAGE INFO ============
    loadStorageInfo() {
        fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                'action': 'get_storage_info'
            })
        })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    this.updateStorageUI(data);
                }
            } catch(e) {
                console.error('Invalid JSON:', text);
            }
        });
    }
    
    updateStorageUI(data) {
        // Add storage bar to your dashboard if you have one
        const storageBar = document.getElementById('storageUsageBar');
        const storageText = document.getElementById('storageUsageText');
        
        if (storageBar) {
            storageBar.style.width = data.usage_percent + '%';
            storageBar.style.backgroundColor = data.usage_percent > 90 ? '#dc3545' : '#28a745';
        }
        
        if (storageText) {
            storageText.textContent = `${data.total_size_formatted} / ${data.max_size_formatted} (${data.usage_percent}%)`;
        }
    }
    
    // ============ FILE ACTIONS ============
previewFile(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const previewUrl = `${this.baseUrl}?download=1&path=${encodeURIComponent(filePath)}`;
    
    let previewContent = '';
    let modalTitle = 'Preview';
    
    // Image files
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    if (imageExts.includes(ext)) {
        previewContent = `<img src="${previewUrl}" style="max-width: 100%; max-height: 70vh; display: block; margin: 0 auto;">`;
        modalTitle = 'Image Preview';
    }
    // PDF files
    else if (ext === 'pdf') {
        previewContent = `<iframe src="${previewUrl}" width="100%" height="500px" style="border: none;"></iframe>`;
        modalTitle = 'PDF Preview';
    }
    // Video files
    else if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
        previewContent = `<video controls style="max-width: 100%; max-height: 70vh;">
                            <source src="${previewUrl}" type="video/${ext}">
                            Your browser does not support the video tag.
                          </video>`;
        modalTitle = 'Video Preview';
    }
    // Audio files
    else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
        previewContent = `<audio controls style="width: 100%;">
                            <source src="${previewUrl}" type="audio/${ext}">
                            Your browser does not support the audio element.
                          </audio>`;
        modalTitle = 'Audio Preview';
    }
    // Text files (txt, html, css, js, json, xml)
    else if (['txt', 'html', 'css', 'js', 'json', 'xml', 'md'].includes(ext)) {
        // Fetch text content via AJAX
        fetch(previewUrl)
            .then(response => response.text())
            .then(text => {
                const previewModal = document.querySelector('.custom-modal.preview-modal');
                if (previewModal) {
                    const body = previewModal.querySelector('.custom-modal-body');
                    body.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; background: #0f172a; padding: 1rem; border-radius: 8px; color: #e2e8f0;">${this.escapeHtml(text)}</pre>`;
                }
            })
            .catch(() => {
                this.showError('Could not load text content');
            });
        previewContent = '<div class="loading-preview">Loading content...</div>';
        modalTitle = 'Text Preview';
    }
    // Unsupported files – show download link
    else {
        previewContent = `<div class="unsupported-preview">
                            <i class="ri-file-line" style="font-size: 4rem;"></i>
                            <p>Preview not available for this file type.</p>
                            <a href="${previewUrl}" download class="btn-primary" style="display: inline-block; margin-top: 1rem;">Download File</a>
                          </div>`;
        modalTitle = 'Preview Unavailable';
    }
    
    // Create modal (if not already open for text files, we may reuse)
    if (!document.querySelector('.custom-modal.preview-modal')) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal preview-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="custom-modal-content" style="max-width: 80%; max-height: 80%; width: auto;">
                <div class="custom-modal-header">
                    <h3>${modalTitle}</h3>
                    <span class="modal-close" onclick="this.closest('.custom-modal').remove()">&times;</span>
                </div>
                <div class="custom-modal-body" style="text-align: center; overflow: auto;">
                    ${previewContent}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // For text files, we already started fetching; for others, content is static
    if (['txt', 'html', 'css', 'js', 'json', 'xml', 'md'].includes(ext)) {
        // The fetch will update the modal content when ready
    }
}
    
    deleteItem(itemPath, isFolder) {
        if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`)) {
            return;
        }
        
        fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                'action': 'delete_item',
                'item_path': itemPath,
                'is_folder': isFolder ? '1' : '0'
            })
        })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    this.showMessage(`${isFolder ? 'Folder' : 'File'} deleted successfully`, 'success');
                    this.loadFolderContents(this.currentPath);
                    this.loadStorageInfo();
                } else {
                    this.showError(data.message);
                }
            } catch(e) {
                console.error('Invalid JSON:', text);
                this.showError('Failed to delete');
            }
        });
    }
    
    shareFile(filePath) {
        // Create shareable link
        const shareUrl = `${window.location.origin}/Datahub/share.php?file=${encodeURIComponent(filePath)}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showMessage('Share link copied to clipboard!', 'success');
        }).catch(() => {
            prompt('Copy this link:', shareUrl);
        });
    }
    
    // ============ UTILITIES ============
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'ri-file-pdf-fill',
            'jpg': 'ri-image-fill',
            'jpeg': 'ri-image-fill',
            'png': 'ri-image-fill',
            'gif': 'ri-image-fill',
            'webp': 'ri-image-fill',
            'txt': 'ri-file-text-fill',
            'doc': 'ri-file-word-fill',
            'docx': 'ri-file-word-fill',
            'xls': 'ri-file-excel-fill',
            'xlsx': 'ri-file-excel-fill',
            'zip': 'ri-file-zip-fill',
            'rar': 'ri-file-zip-fill',
            'mp4': 'ri-video-fill',
            'mp3': 'ri-music-fill',
            'html': 'ri-code-fill',
            'css': 'ri-css3-fill',
            'js': 'ri-javascript-fill'
        };
        return icons[ext] || 'ri-file-fill';
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    closeModals() {
        document.querySelectorAll('.custom-modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    showMessage(message, type) {
        if (typeof showToast === 'function') {
            showToast(message, type);
                    } 
        else {
                alert(message);
            }
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .folder-card {
        cursor: pointer;
        transition: transform 0.2s;
    }
    .folder-card:hover {
        transform: translateY(-2px);
    }
    .back-btn {
        background: #6c757d;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
    }
    .empty-message {
        text-align: center;
        padding: 40px;
        color: #999;
    }
`;
document.head.appendChild(style);

// Initialize
let fileManager;
document.addEventListener('DOMContentLoaded', () => {
    fileManager = new FileManager();

     const uploadBtn = document.getElementById('uploadFileBtn');
    if (uploadBtn) {
         uploadBtn.addEventListener('click', function() {
            setTimeout(() => {
                if (fileManager) {
                    fileManager.loadFolderSelect();
                }
            }, 100);
        });
    }
});