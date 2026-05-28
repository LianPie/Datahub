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

// ---------- Restore ----------
document.querySelectorAll('.restore-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const fileId = this.dataset.id;
        const confirmed = await showConfirm(
            'Restore File',
            'Are you sure you want to restore this file? It will reappear in your files.',
            'Restore',
            'Cancel'
        );
        if (!confirmed) return;
        
        try {
            const res = await fetch('/Datahub/Handlers/restore_file.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${fileId}`
            });
            const data = await res.json();
            if (data.success) {
                if (typeof showToast === 'function') showToast('File restored successfully', 'success');
                location.reload();
            } else {
                if (typeof showToast === 'function') showToast('Error restoring file', 'error');
            }
        } catch (err) {
            if (typeof showToast === 'function') showToast('Network error', 'error');
        }
    });
});

// ---------- Permanent Delete ----------
document.querySelectorAll('.permanent-delete-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const fileId = this.dataset.id;
        const confirmed = await showConfirm(
            'Permanent Delete',
            '<span style="color:#f87171;">⚠️ This action cannot be undone!</span><br>Are you sure you want to permanently delete this file?',
            'Yes, Delete Permanently',
            'Cancel'
        );
        if (!confirmed) return;
        
        try {
            const res = await fetch('/Datahub/Handlers/permanent_delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${fileId}`
            });
            const data = await res.json();
            if (data.success) {
                if (typeof showToast === 'function') showToast('File deleted permanently', 'success');
                location.reload();
            } else {
                if (typeof showToast === 'function') showToast('Error deleting file', 'error');
            }
        } catch (err) {
            if (typeof showToast === 'function') showToast('Network error', 'error');
        }
    });
});

async function loadTrashContents() {
      const container = document.getElementById('trashContainer');
    if (!container) return;
    
    // Show loader
    container.innerHTML = `
        <div class="loader-container" style="display: flex; justify-content: center; align-items: center; padding: 60px;">
            <div class="loader-spinner"></div>
            <span style="margin-left: 10px;">${__('loading')}</span>
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
                renderTrashItems(data.trash_items);
            } else {
                // Show empty trash message
                container.innerHTML = `
                    <div class="empty-trash">
                        <i class="ri-delete-bin-7-line"></i>
                        <p>${__('trash_empty')}</p>
                    </div>
                `;
            }
        }, delay);

    }  catch (error) {
        console.error('Error loading trash:', error);
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            container.innerHTML = `
                <div class="empty-trash">
                    <i class="ri-error-warning-line"></i>
                    <p>${__('error_loading_trash')}</p>
                </div>
            `;
        }, delay);
    }
}
function renderTrashItems(items) {
    const container = document.getElementById('trashContainer');
    
    let html = `<div class="files-grid">`;
    
    items.forEach(item => {
        const icon = item.is_folder ? 'ri-folder-line' : getFileIcon(item.original_name);
        const sizeFormatted = formatBytes(item.size);
        
        html += `
            <div class="file-card">
                <div class="file-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="file-name">${escapeHtml(item.original_name)}</div>
                <div class="file-size">${sizeFormatted}</div><div class="file-folder">
                    <small><i class="ri-folder-line"></i> <?= __('original_location') ?>: <span style="word-break: break-word; overflow-wrap: break-word;">${escapeHtml(item.original_path)}</span></small>
                </div>
                <div class="file-actions">
                    <button class="preview-btn" onclick="restoreItem(${item.id})" title="${__('restore')}">
                        <i class="ri-arrow-go-back-line"></i>
                    </button>
                    <button class="delete-btn" onclick="permanentDeleteItem(${item.id})" title="${__('delete_permanently')}">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    // Add empty trash button at the top
    html = `
        <div style="text-align: right; margin-bottom: 20px;">
            <button class="btn-danger" onclick="emptyTrash()" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                <i class="ri-delete-bin-2-line"></i> ${__('empty_trash')}
            </button>
        </div>
    ` + html;
    
    container.innerHTML = html;
}

async function restoreItem(itemId) {
    const confirmed = confirm(__('restore'));
    if (!confirmed) return;
    
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
            showError( __('restore_success'));
            loadTrashContents();
        } else {
            showError(__('restore_failed'));
        }
    } catch (error) {
        showError(__('network_error'));
    }
}

async function permanentDeleteItem(itemId) {
    const confirmed = confirm(__('confirm_delete_permanent'));
    if (!confirmed) return;
    
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
    const confirmed = confirm(__('confirm_empty_trash'));
    if (!confirmed) return;
    
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
            showError(__('trash_emptied_successfully'));
            loadTrashContents();
        } else {
            showError(data.message || __('error_emptying_trash'));
        }
    } catch (error) {
        showError(__('network_error'));
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];
    
    if (imageExts.includes(ext)) return 'ri-image-line';
    if (videoExts.includes(ext)) return 'ri-movie-line';
    if (audioExts.includes(ext)) return 'ri-music-line';
    return 'ri-file-line';
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