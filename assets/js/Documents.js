document.addEventListener('DOMContentLoaded', function() {
    
    loadDocuments();
});

const baseUrl = '/Datahub/Handlers/documentHandler.php';

// Load documents from server via AJAX
function loadDocuments() {
    const documentsGrid = document.getElementById('documentsGrid');
    
    // Show loader
    documentsGrid.innerHTML = `
        <div class="loader-container" style="grid-column: 1/-1;">
            <div class="loader-spinner"></div>
            <span style="margin-left: 10px;">${__('loading')}</span>
        </div>
    `;
    
    const minLoaderTime = 300;
    const startTime = Date.now();
    
    fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: 'action=list_documents'
    })
    .then(res => res.json())
    .then(data => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            if (data.success) {
                renderDocuments(data.documents);
            } else {
                documentsGrid.innerHTML = `<div class="empty-message">${data.message ||  __('error_loading_documents')} </div>`;
            }
        }, delay);
    })
    .catch(error => {
        console.error('Error loading documents:', error);
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            documentsGrid.innerHTML = `<div class="empty-message">${__('error_loading_documents')}</div>`;
        }, delay);
    });
}

// Render documents function
function renderDocuments(documents) {
    const documentsGrid = document.getElementById('documentsGrid');
    
    if (!documents || documents.length === 0) {
        documentsGrid.innerHTML = `
            <div class="empty-message" style="grid-column: 1/-1;">
                <i class="ri-file-text-line" style="font-size: 48px; color: #ccc;"></i>
                <p>${__('no_documents_yet')}</p>
                <button class="btn-custom" onclick="createNewDocument()" style="margin-top: 15px;">
                    <i class="ri-add-line"></i> ${__('create_first_document')}
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    documents.forEach(doc => {
        html += `
            <div class="document-card">
                <div class="document-icon">
                    <i class="ri-file-text-line"></i>
                </div>
                <div class="document-name">${escapeHtml(doc.name)}</div>
                <div class="document-meta">
                    <span><i class="ri-calendar-line"></i> ${doc.modified ||  __('unknown_date')}</span>
                    <span><i class="ri-database-line"></i> ${doc.size_formatted || '0 KB'}</span>
                </div>
                <div class="document-actions">
                    <button class="preview-btn" onclick="viewDocument('${escapeHtml(doc.name)}')"><i class="ri-eye-line"></i></button>
                    <button class="preview-btn" onclick="editDocument('${escapeHtml(doc.name)}')"><i class="ri-edit-line"></i></button>
                    <button class="delete-btn" onclick="deleteDocument('${doc.path}', false)"><i class="ri-delete-bin-line"></i></button>
                        

                </div>
            </div>
        `;
    });
    
    // Add create document button at the top
    const createButton = `
        <div style="grid-column: 1/-1; text-align: right; margin-bottom: 10px;">
            <button class="btn-custom" onclick="createNewDocument()">
                <i class="ri-add-line"></i> ${__('new_document')}
            </button>
        </div>
    `;
    
    documentsGrid.innerHTML = createButton + html;
}



    async function deleteDocument(itemPath, isFolder) {
        const typeText = isFolder ? __('delete_folder') : __('delete_file');
        const confirmMessage = isFolder ? __('confirm_delete_folder') : __('confirm_delete_file');

        const confirmed = await fileManager.showConfirm(
            typeText,
            confirmMessage,
            __('move_to_trash'),
            __('cancel')
        );
        if (!confirmed) return;
                
        try {
            const response = await fetch('/Datahub/Handlers/UploadHandler.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest'},
                body: new URLSearchParams({'action': 'delete_item', 'item_path': itemPath, 'is_folder': isFolder ? '1' : '0'})
            });
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (data.success) {
                showMessage(__('delete_success'), 'success');
                loadDocuments();
            } else {
                showError(__(data.message));
            }
        } catch(e) {
    console.error('Delete error details:', e);
    
    // Check for different error types
    if (e.name === 'TypeError') {
        showError(__('network_error') + ': ' + __('check_connection'));
    } else if (e.name === 'SyntaxError') {
        showError(__('server_error') + ': ' + __('invalid_server_response'));
    } else if (e.message && e.message.includes('JSON')) {
        showError(__('server_error') + ': ' + __('invalid_json_response'));
    } else if (e.message) {
        showError(__('delete_failed') + ': ' + e.message);
    } else {
        showError(__('delete_failed') + ': ' + __('unknown_error'));
    }
}
    }

// Document CRUD functions
function createNewDocument() {
    const name = __('enter_document_name');
    if (name && name.trim()) {
        window.location.href = `editor.php?action=new&name=${encodeURIComponent(name.trim())}`;
    }
}

function viewDocument(name) {
    window.open(`editor.php?doc=${encodeURIComponent(name)}`, '_blank');
}

function editDocument(name) {
    window.location.href = `editor.php?action=edit&doc=${encodeURIComponent(name)}`;
}

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


// Helper functions
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];
    
    if (imageExts.includes(ext)) return 'ri-image-line';
    if (videoExts.includes(ext)) return 'ri-movie-line';
    if (audioExts.includes(ext)) return 'ri-music-line';
    if (ext === 'pdf') return 'ri-file-pdf-line';
    if (ext === 'zip' || ext === 'rar') return 'ri-file-zip-line';
    return 'ri-file-line';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Placeholder functions for file actions (implement as needed)
function previewFile(path) {
    // Your existing preview logic
    console.log('Preview file:', path);
}


function shareFile(path) {
    console.log('Share file:', path);
}