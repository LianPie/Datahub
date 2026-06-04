let confirmResolver = null;

function showConfirm(title, message, okText = 'Yes', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        confirmResolver = resolve;
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').innerText = title;
        document.getElementById('confirmMessage').innerHTML = message;
        document.getElementById('confirmOkBtn').innerText = okText;
        document.getElementById('confirmCancelBtn').innerText = cancelText;
        modal.style.display = 'flex';
    });
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
    if (confirmResolver) {
        confirmResolver(false);
        confirmResolver = null;
    }
}

function resolveConfirm(confirmed) {
    if (confirmResolver) {
        confirmResolver(confirmed);
        confirmResolver = null;
    }
    closeConfirmModal();
}

document.getElementById('confirmOkBtn').addEventListener('click', () => resolveConfirm(true));
document.getElementById('confirmCancelBtn').addEventListener('click', () => resolveConfirm(false));
window.addEventListener('click', (e) => {
    const modal = document.getElementById('confirmModal');
    if (e.target === modal) resolveConfirm(false);
});



async function loadTrashContents() {
    const foldersContainer = document.getElementById('trashFoldersList');
    const filesContainer = document.getElementById('trashFilesGrid');
    
    if (!foldersContainer || !filesContainer) return;
    
    // Show loaders in both sections
    foldersContainer.innerHTML = `
        <div class="files-grid">
            <div class="loader-container" style="display: flex; justify-content: center; align-items: center; padding: 60px; grid-column: 1/-1;">
                <div class="loader-spinner"></div>
                <span style="margin-left: 10px;">${__('loading')}</span>
            </div>
        </div>
    `;
    
    filesContainer.innerHTML = `
        <div class="files-grid">
            <div class="loader-container" style="display: flex; justify-content: center; align-items: center; padding: 60px; grid-column: 1/-1;">
                <div class="loader-spinner"></div>
                <span style="margin-left: 10px;">${__('loading')}</span>
            </div>
        </div>
    `;
    
    const minLoaderTime = 300;
    const startTime = Date.now();
    
    try {
        const response = await fetch('/Datahub/Handlers/UploadHandler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: 'action=get_trash_contents'
        });
        
        const text = await response.text();
        let data;
        
        try {
            data = JSON.parse(text);
        } catch (jsonError) {
            console.error('Invalid JSON:', text);
            showError(__('error_loading_trash'));
            return;
        }
        
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            if (data.success && data.trash_items && data.trash_items.length > 0) {
                renderTrashContents(data.trash_items);
            } else {
                 // Hide both sections completely
                const foldersSection = document.querySelector('.folders-section');
                const filesSection = document.querySelector('.files-section');
                const emptyTrashBtnContainer = document.getElementById('emptyTrashBtnContainer');
                
                if (foldersSection) foldersSection.style.display = 'none';
                if (filesSection) filesSection.style.display = 'none';
                if (emptyTrashBtnContainer) emptyTrashBtnContainer.style.display = 'none';
                
                // Show global empty message
                const dashboard = document.querySelector('.dashboard-content');
                if (dashboard && !document.getElementById('globalEmptyMsg')) {
                    const emptyMsg = document.createElement('div');
                    emptyMsg.id = 'globalEmptyMsg';
                    emptyMsg.className = 'empty-trash';
                    emptyMsg.style.textAlign = 'center';
                    emptyMsg.style.padding = '60px';
                    emptyMsg.innerHTML = `
                        <i class="ri-delete-bin-7-line" style="font-size: 48px;"></i>
                        <p>${__('trash_empty')}</p>
                    `;
                    dashboard.appendChild(emptyMsg);
                }
            }
        }, delay);

    } catch (error) {
        console.error('Error loading trash:', error);
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            foldersContainer.innerHTML = `
                <div class="files-grid">
                    <div class="empty-trash" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                        <i class="ri-error-warning-line"></i>
                        <p>${__('error_loading_trash')}</p>
                    </div>
                </div>
            `;
            filesContainer.innerHTML = `
                <div class="files-grid">
                    <div class="empty-trash" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                        <i class="ri-error-warning-line"></i>
                        <p>${__('error_loading_trash')}</p>
                    </div>
                </div>
            `;
        }, delay);
    }
}

function renderTrashContents(items) {
    const foldersContainer = document.getElementById('trashFoldersList');
    const filesContainer = document.getElementById('trashFilesGrid');
    const emptyTrashBtnContainer = document.getElementById('emptyTrashBtnContainer');
    
    const folders = items.filter(item => item.is_folder === true || item.is_folder === 1);
    const files = items.filter(item => !(item.is_folder === true || item.is_folder === 1));
    
    if (emptyTrashBtnContainer) {
        emptyTrashBtnContainer.style.display = (folders.length > 0 || files.length > 0) ? 'block' : 'none';
    }
    
    if (folders.length > 0) {
        let foldersHtml = '<div class="folders-list">';
        folders.forEach(folder => {
            foldersHtml += renderFolderCard(folder);
        });
        foldersHtml += '</div>';
        foldersContainer.innerHTML = foldersHtml;
        document.querySelector('.folders-section').style.display = 'block';
    } else {
        document.querySelector('.folders-section').style.display = 'none';
    }
    
    if (files.length > 0) {
        let filesHtml = '<div class="files-grid">';
        files.forEach(file => {
            filesHtml += renderFileCard(file);
        });
        filesHtml += '</div>';
        filesContainer.innerHTML = filesHtml;
        document.querySelector('.files-section').style.display = 'block';
    } else {
        document.querySelector('.files-section').style.display = 'none';
    }
    
    if (folders.length === 0 && files.length === 0) {
        const dashboard = document.querySelector('.dashboard-content');
        if (dashboard && !document.getElementById('globalEmptyMsg')) {
            const emptyMsg = document.createElement('div');
            emptyMsg.id = 'globalEmptyMsg';
            emptyMsg.className = 'empty-trash';
            emptyMsg.innerHTML = `<i class="ri-delete-bin-7-line"></i><p>${__('trash_empty')}</p>`;
            dashboard.appendChild(emptyMsg);
        }
    }
}

function renderFolderCard(folder) {
    const folderName = folder.original_name || folder.name;
    const deletedDate = folder.deleted_at_formatted || folder.modified || '';
    return `
        <div class="folder-card" data-folder-id="${folder.id}">
            <div class="folder-info">
                <i class="ri-folder-line"></i>
                <span class="folder-name">${escapeHtml(folderName)}</span>
                <small>${deletedDate}</small>
            </div>
            <div class="folder-actions">
                <button class="restore-btn" onclick="restoreItem(${folder.id})" title="${__('restore')}">
                    <i class="ri-arrow-go-back-line"></i>
                </button>
                <button class="permanent-delete-btn" onclick="permanentDeleteItem(${folder.id})" title="${__('delete_permanently')}">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `;
}

function renderFileCard(file) {
    const icon = getFileIcon(file.original_name);
    const sizeFormatted = formatBytes(file.size);
    return `
        <div class="file-card">
            <div class="file-icon"><i class="${icon}"></i></div>
            <div class="file-name">${escapeHtml(file.original_name)}</div>
            <div class="file-size">${sizeFormatted}</div>
            <div class="file-folder">
                <small><i class="ri-folder-line"></i> ${__('original_location')}: ${escapeHtml(file.original_path)}</small>
            </div>
            <div class="file-actions">
                <button class="restore-btn" onclick="restoreItem(${file.id})" title="${__('restore')}"><i class="ri-arrow-go-back-line"></i></button>
                <button class="delete-btn" onclick="permanentDeleteItem(${file.id})" title="${__('delete_permanently')}"><i class="ri-delete-bin-line"></i></button>
            </div>
        </div>
    `;
}


// Load trash items function
function loadTrashItems() {
    const container = document.getElementById('trashContainer');
    if (container) {
        container.innerHTML = `<div class="loading">${__('loading')}...</div>`;
    }
    
    fetch('/Datahub/Handlers/FileHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: new URLSearchParams({
            'action': 'get_trash_items'
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            renderTrashItems(data.items);
        } else {
            container.innerHTML = `<div class="error-message">${__('error_loading_trash')}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        container.innerHTML = `<div class="error-message">${__('error_loading_trash')}</div>`;
    });
}





function emptyTrash() {
    if (confirm(__('confirm_empty_trash'))) {
        // Your empty trash AJAX call here
        fetch('/Datahub/Handlers/FileHandler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                'action': 'empty_trash'
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showMessage(__('empty_trash_success'), 'success');
                loadTrashItems(); // Reload trash
            } else {
                showMessage(__('empty_trash_failed'), 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(__('empty_trash_failed'), 'error');
        });
    }
}


async function restoreItem(itemId) {
    const userConfirmed = await showConfirm(
        __('restore'),
        __('confirm-restore'),
        __('restore'),
        __('cancel'),
    );
    
    if (!userConfirmed) return;
    
    try {
        const response = await fetch('/Datahub/Handlers/UploadHandler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: `action=restore_item&item_id=${itemId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage( __('restore_success'),'success');
            loadTrashContents();
        } else {
            showError(__('restore_failed'));
        }
    } catch (error) {
        showError(__('network_error'));
    }
}

async function permanentDeleteItem(itemId) {
    
    const userConfirmed = await showConfirm(
        __('delete_permanently'),
        __('confirm_delete_permanent'),
        __('delete_permanently'),
        __('cancel'),
    );
    
    if (!userConfirmed) return;
    
    
    try {
        const response = await fetch('/Datahub/Handlers/UploadHandler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: `action=permanent_delete&item_id=${itemId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(__('delete_permanent_success'),'success');
            loadTrashContents();
        } else {
            showError(__('delete_permanent_failed'));
        }
    } catch (error) {
        showError(__('network_error'));
    }
}

async function emptyTrash() {

    
    const userConfirmed = await showConfirm(
        __('empty_trash'),
        __('confirm_empty_trash'),
        __('empty_trash'),
        __('cancel'),
    );
    
    if (!userConfirmed) return;

    
    try {
        const response = await fetch('/Datahub/Handlers/UploadHandler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: 'action=empty_trash'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(__('empty_trash_success'), 'success');
            loadTrashContents();
        } else {
            showError(data.message || __('empty_trash_failed'));
        }
    } catch (error) {
        showError(__('empty_trash_failed'));
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    const iconMap = {
        // Images
        'jpg': 'ri-image-fill', 'jpeg': 'ri-image-fill', 'png': 'ri-image-fill',
        'gif': 'ri-image-fill', 'webp': 'ri-image-fill', 'svg': 'ri-image-fill',
        'bmp': 'ri-image-fill', 'ico': 'ri-image-fill',
        
        // Videos
        'mp4': 'ri-video-fill', 'webm': 'ri-video-fill', 'mov': 'ri-video-fill',
        'avi': 'ri-video-fill', 'mkv': 'ri-video-fill', 'flv': 'ri-video-fill',
        
        // Audio
        'mp3': 'ri-music-fill', 'wav': 'ri-music-fill', 'm4a': 'ri-music-fill',
        'flac': 'ri-music-fill', 'aac': 'ri-music-fill', 'wma': 'ri-music-fill',
        
        // Adobe
        'pdf': 'ri-file-pdf-fill', 'psd': 'ri-image-edit-fill',
        'ai': 'ri-brush-fill', 'indd': 'ri-layout-fill',
        
        // Microsoft Office
        'doc': 'ri-file-word-fill', 'docx': 'ri-file-word-fill',
        'xls': 'ri-file-excel-fill', 'xlsx': 'ri-file-excel-fill',
        'ppt': 'ri-file-ppt-fill', 'pptx': 'ri-file-ppt-fill',
        
        // Apple iWork
        'pages': 'ri-file-text-fill', 'numbers': 'ri-table-fill', 'key': 'ri-presentation-fill',
        
        // Text
        'txt': 'ri-file-text-fill', 'rtf': 'ri-file-text-fill',
        'md': 'ri-markdown-fill', 'html': 'ri-html5-fill', 'css': 'ri-css3-fill',
        'js': 'ri-javascript-fill', 'json': 'ri-code-fill', 'xml': 'ri-code-fill', 'csv': 'ri-table-fill',
        
        // Archives
        'zip': 'ri-file-zip-fill', 'rar': 'ri-file-zip-fill', '7z': 'ri-file-zip-fill',
        
        // Code
        'py': 'ri-python-fill', 'php': 'ri-php-fill', 'java': 'ri-java-fill',
        'cpp': 'ri-c-fill', 'c': 'ri-c-fill', 'go': 'ri-go-fill', 'rb': 'ri-ruby-fill',
        'sql': 'ri-database-fill',
        
        // Fonts
        'ttf': 'ri-font-fill', 'otf': 'ri-font-fill', 'woff': 'ri-font-fill',
        
        // 3D
        'stl': 'ri-3d-print-fill', 'obj': 'ri-3d-print-fill', 'dwg': 'ri-building-fill',
        
        // Ebooks & Corel
        'epub': 'ri-book-fill', 'cdr': 'ri-image-edit-fill',
        
        // Database
        'db': 'ri-database-fill', 'sqlite': 'ri-database-fill'
    };
    
    return iconMap[ext] || 'ri-file-fill';
}

function formatBytes(bytes) {
    if (bytes === 0 || !bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTrashContents();
});


function showMessage(message, type) {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            alert(message);
        }
    }
    
function showError(message) {
        showMessage(message, 'error');
    }