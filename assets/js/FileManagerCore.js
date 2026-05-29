// FileManagerCore.js - load and render Ui
class FileManagerCore {
    constructor() {
        this.currentPath = '';
        this.baseUrl = '/Datahub/Handlers/UploadHandler.php';
    }
    
    async loadFolderContents(path = '') {
        this.currentPath = path;
        
        // Show loader in both folders and files containers
        const foldersList = document.querySelector('.folders-list');
        const filesGrid = document.querySelector('.files-grid');
        
        if (foldersList) {
            foldersList.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                    <div class="loader-spinner"></div>
                    <span style="margin-left: 10px;">${__('loading') || 'Loading folders...'}</span>
                </div>
            `;
        }
        
        if (filesGrid) {
            filesGrid.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                    <div class="loader-spinner"></div>
                    <span style="margin-left: 10px;">${__('loading') || 'Loading files...'}</span>
                </div>
            `;
        }
        
        const minLoaderTime = 100;
        const startTime = Date.now();
        
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams({
                    'action': 'get_folder_contents', 
                    'folder_path': this.currentPath
                })
            });
            
            const text = await response.text();
            const data = JSON.parse(text);
            
            const elapsed = Date.now() - startTime;
            const delay = Math.max(0, minLoaderTime - elapsed);

            if (data.success) {
                  setTimeout(() => {
                        this.renderUI(data.data);
                    }, delay);
                    return data.data;
            } else {
                 setTimeout(() => {
                    this.showError(data.message);
                    if (foldersList) foldersList.innerHTML = `<div class="empty-message">${data.message || __('error_loading_folders')}</div>`;
                    if (filesGrid) filesGrid.innerHTML = `<div class="empty-message">${data.message || __('error_loading_files')}</div>`;
                }, delay);
                return null;
            }
        } catch(e) {
            console.error('Error:', e);
            const elapsed = Date.now() - startTime;
            const delay = Math.max(0, minLoaderTime - elapsed);

            setTimeout(() => {
                this.showError(__('error_loading_files'));
                if (foldersList) foldersList.innerHTML = `<div class="empty-message">${__('error_loading_folders')}</div>`;
                if (filesGrid) filesGrid.innerHTML = `<div class="empty-message">${__('error_loading_files')}</div>`;
            }, delay);
            return null;
        }
    }
    
    renderUI(data) {
        this.renderFolders(data.folders || []);
        this.renderFiles(data.files || []);
    }
    
    renderFolders(folders) {
    const foldersList = document.querySelector('.folders-list');
    if (!foldersList) return;

    if (folders.length === 0) {
        foldersList.innerHTML = '<div class="empty-message">' + (__('no_folders_yet') || 'No folders yet') + '</div>';
        return;
    }

    let html = '';
    folders.forEach(folder => {
        const folderName = folder.name;
        const folderPath = folder.path;
        const createdDate = folder.modified || new Date().toISOString().split('T')[0];

        html += `
            <div class="folder-card" data-folder-path="${folderPath}">
                <div class="folder-info" onclick="fileManager?.openFolder('${folderPath}')">
                    <i class="ri-folder-line"></i>
                    <span class="folder-name">${this.escapeHtml(folderName)}</span>
                    <small>${createdDate}</small>
                </div>
                <button class="folder-delete-btn" onclick="window.fileManagerActions.deleteItem('${folderPath}', true)" title="${__('delete_folder') || 'Delete folder'}">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;
    });

    foldersList.innerHTML = html;
}
    
    renderFiles(files) {
        const filesGrid = document.querySelector('.files-grid');
        if (!filesGrid) return;
        
        if (files.length === 0) {
            filesGrid.innerHTML = `<div class="empty-message">${__('no_files_yet')}</div>`;
            return;
        }
        
        let html = '';
        files.forEach(file => {
            const icon = this.getFileIcon(file.name);
            const fileSize = file.size_formatted || this.formatBytes(file.size);
            const folderName = this.currentPath || __('root');
            
            html += `<div class="file-card">
                        <div class="file-icon"><i class="${icon}"></i></div>
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${fileSize}</div>
                        <div class="file-folder"><small>${__('location_in')} "${this.escapeHtml(folderName)}"</small></div>
                        <div class="file-actions">
                            <button class="preview-btn" onclick="fileManager.previewFile('${file.path}')"><i class="ri-eye-line"></i></button>
                            <a href="${this.baseUrl}?download=1&path=${encodeURIComponent(file.path)}" download><i class="ri-download-line"></i></a>
                            <button class="delete-btn" onclick="fileManager.deleteItem('${file.path}', false)"><i class="ri-delete-bin-line"></i></button>
                            <button class="share-btn" onclick="fileManager.shareFile('${file.path}')"><i class="ri-share-line"></i></button>
                        </div>
                    </div>`;
        });
        filesGrid.innerHTML = html;
    }
    
    async loadStorageInfo() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest'},
                body: new URLSearchParams({'action': 'get_storage_info'})
            });
            
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (data.success) {
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
        } catch(e) {
            console.error('Failed to load storage info', e);
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
    
    
    openFolder(folderPath) {
        this.loadFolderContents(folderPath);
        const pageTitle = document.querySelector('.dashboard-content h2');
        if (pageTitle) {
            const folderName = folderPath.split('/').pop();
            pageTitle.innerHTML = `${this.escapeHtml(folderName)} <i class="ri-folder-line"></i> `;
            
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
        
        const pathParts = this.currentPath.split('/');
        pathParts.pop(); 
        const parentPath = pathParts.join('/');
        
        this.loadFolderContents(parentPath);
        
        const pageTitle = document.querySelector('.dashboard-content h2');
        if (pageTitle) {
            if (parentPath) {
                const folderName = parentPath.split('/').pop();
                pageTitle.innerHTML = `${this.escapeHtml(folderName)} <i class="ri-folder-line"></i>`;
                
                if (!pageTitle.querySelector('.back-btn')) {
                    const backBtn = document.createElement('button');
                    backBtn.innerHTML = '← Back';
                    backBtn.className = 'back-btn';
                    backBtn.onclick = () => this.goBack();
                    backBtn.style.marginLeft = '10px';
                    pageTitle.appendChild(backBtn);
                }
            } else {
                pageTitle.innerHTML =  __('all_files_folders');
                const backBtn = pageTitle.querySelector('.back-btn');
                if (backBtn) backBtn.remove();
            }
        }
    }
    
    isUploadsPage() {
        return window.location.pathname.includes('/Dashboard/Uploads.php');
    }
    
    redirectToUploadsPage() {
        if (!this.isUploadsPage()) {
            window.location.href = '/Datahub/Dashboard/Uploads.php';
        }
    }
    
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'ri-file-pdf-fill', 'jpg': 'ri-image-fill', 'jpeg': 'ri-image-fill',
            'png': 'ri-image-fill', 'gif': 'ri-image-fill', 'webp': 'ri-image-fill',
            'txt': 'ri-file-text-fill', 'doc': 'ri-file-word-fill', 'docx': 'ri-file-word-fill',
            'zip': 'ri-file-zip-fill', 'mp4': 'ri-video-fill', 'mp3': 'ri-music-fill'
        };
        return icons[ext] || 'ri-file-fill';
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showMessage(message, type) {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
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