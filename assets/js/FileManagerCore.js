// FileManagerCore.js - load and render Ui
class FileManagerCore {
    constructor() {
        this.currentPath = '';
        this.baseUrl = '/Datahub/Handlers/UploadHandler.php';
    }
    
    // Add these methods to your fileManager object

    initSearchAndFilter() {
        // Search input handler
        const searchInput = document.getElementById('searchInput');
        const searchClearIcon = document.getElementById('searchClearIcon');
        const searchForm = document.querySelector('.search-form');
        
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchValue = searchInput.value.trim();
                this.currentSearch = searchValue;
                this.loadFolderContents(this.currentPath, searchValue, this.currentFilter);
            });
        }
        
        if (searchClearIcon && searchInput) {
            searchClearIcon.addEventListener('click', () => {
                searchInput.value = '';
                this.currentSearch = '';
                this.loadFolderContents(this.currentPath, '', this.currentFilter);
            });
        }
        
        // Filter buttons handler
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.type;
                
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentFilter = filterType;
                this.loadFolderContents(this.currentPath, this.currentSearch, filterType);
            });
        });
    }




    async loadFolderContents(path = '', search = '', filter = 'all') {
        this.currentPath = path;
        this.currentSearch = search || this.currentSearch || '';
        this.currentFilter = filter || this.currentFilter || 'all';

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
            
            const bodyParams = {
                'action': 'get_folder_contents', 
                'folder_path': this.currentPath
            };
            
            // Add search and filter if they exist
            if (this.currentSearch) {
                bodyParams.search = this.currentSearch;
            }
            if (this.currentFilter && this.currentFilter !== 'all') {
                bodyParams.filter = this.currentFilter;
            }
            console.log(this.currentFilter)
            

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams(bodyParams)
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
                        </div>
                    </div>`;
        });
        filesGrid.innerHTML = html;
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
        
        // Complete icon mapping
        const icons = {
            // Images
            'jpg': 'ri-image-fill', 'jpeg': 'ri-image-fill', 'png': 'ri-image-fill',
            'gif': 'ri-image-fill', 'webp': 'ri-image-fill', 'bmp': 'ri-image-fill',
            'svg': 'ri-image-fill', 'tiff': 'ri-image-fill', 'ico': 'ri-image-fill',
            'heic': 'ri-image-fill', 'raw': 'ri-image-fill',
            
            // Adobe Files
            'pdf': 'ri-file-pdf-fill',
            'psd': 'ri-draw-fill',
            'ai': 'ri-compasses-fill',
            'indd': 'ri-quill-pen-fill',
            'eps': 'ri-film-fill',
            'prproj': 'ri-film-fill',
            'ps': 'ri-draw-fill',
            'xd': 'ri-pages-fill',
            'svg': 'ri-compasses-fill',

            // CorelDRAW
            'cdr': 'ri-image-edit-line',  // CorelDRAW vector file
            'cdr3': 'ri-image-edit-line',
            'cdr4': 'ri-image-edit-line',
            'cdr5': 'ri-image-edit-line',
            'cdr6': 'ri-image-edit-line',
            'cdrw': 'ri-image-edit-line',
            'cdt': 'ri-file-copy-line',   // CorelDRAW template
            'cdx': 'ri-file-copy-line',   // CorelDRAW compressed
            'cmx': 'ri-file-copy-line',   // Corel Exchange
            'cpt': 'ri-image-edit-line',  // Corel Photo-Paint
            
            // Microsoft Office
            'doc': 'ri-file-word-fill', 'docx': 'ri-file-word-fill',
            'xls': 'ri-file-excel-fill', 'xlsx': 'ri-file-excel-fill',
            'ppt': 'ri-file-ppt-fill', 'pptx': 'ri-file-ppt-fill',
            'mdb': 'ri-database-fill', 'accdb': 'ri-database-fill',
            'pub': 'ri-file-pdf-fill',
            'one': 'ri-sticky-note-fill',
            
            // Apple iWork
            'pages': 'ri-file-text-fill',
            'numbers': 'ri-table-fill',
            'key': 'ri-presentation-fill',
            
            // Text & Documents
            'txt': 'ri-file-text-fill',
            'rtf': 'ri-file-text-fill',
            'md': 'ri-markdown-fill',
            'csv': 'ri-table-fill',
            'xml': 'ri-code-fill',
            'json': 'ri-code-fill',
            'html': 'ri-html5-fill',
            'css': 'ri-css3-fill',
            
            // Archives
            'zip': 'ri-file-zip-fill', 'rar': 'ri-file-zip-fill', '7z': 'ri-file-zip-fill',
            'tar': 'ri-file-zip-fill', 'gz': 'ri-file-zip-fill', 'bz2': 'ri-file-zip-fill',
            
            // Videos
            'mp4': 'ri-video-fill', 'avi': 'ri-video-fill', 'mkv': 'ri-video-fill',
            'mov': 'ri-video-fill', 'wmv': 'ri-video-fill', 'flv': 'ri-video-fill',
            'webm': 'ri-video-fill', 'm4v': 'ri-video-fill', 'mpg': 'ri-video-fill',
            'mpeg': 'ri-video-fill', '3gp': 'ri-video-fill',
            
            // Audio
            'mp3': 'ri-music-fill', 'wav': 'ri-music-fill', 'flac': 'ri-music-fill',
            'm4a': 'ri-music-fill', 'aac': 'ri-music-fill', 'ogg': 'ri-music-fill',
            'opus': 'ri-music-fill', 'wma': 'ri-music-fill',
            
            // Programming
            'js': 'ri-javascript-fill', 'py': 'ri-code-box-fill', 'php': 'ri-php-fill',
            'java': 'ri-java-fill', 'cpp': 'ri-code-box-fill', 'c': 'ri-code-box-fill',
            'go': 'ri-go-fill', 'rb': 'ri-ruby-fill', 'rs': 'ri-rust-fill',
            'swift': 'ri-code-box-fill', 'kt': 'ri-code-box-fill', 'ts': 'ri-code-box-fill',
            'sql': 'ri-database-fill',
            
            // Fonts
            'ttf': 'ri-font-fill', 'otf': 'ri-font-fill', 'woff': 'ri-font-fill',
            'woff2': 'ri-font-fill',
            
            // 3D & CAD
            'stl': 'ri-box-3-fill', 'obj': 'ri-box-3-fill', 'dwg': 'ri-box-3-fill',
            
            // Ebooks
            'epub': 'ri-book-fill', 'mobi': 'ri-book-fill',
            
            // Databases
            'db': 'ri-database-fill', 'sqlite': 'ri-database-fill',
            
            // Contacts
            'vcf': 'ri-contacts-fill', 'ics': 'ri-calendar-fill'
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