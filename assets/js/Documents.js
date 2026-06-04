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
                    <button class="delete-btn" onclick="deleteDocument('${escapeHtml(doc.name)}')"><i class="ri-delete-bin-line"></i></button>
                        

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

function deleteDocument(name) {
    if (confirm(`${__('confirm_delete_document')} ${name}"?`)) {
        const minLoaderTime = 300;
        const startTime = Date.now();
        
        // Show loader in the document card
        const docCards = document.querySelectorAll('.document-card');
        let targetCard = null;
        for (let card of docCards) {
            if (card.querySelector('.document-name')?.innerText === name) {
                targetCard = card;
                break;
            }
        }
        
        if (targetCard) {
            targetCard.style.opacity = '0.5';
            targetCard.style.pointerEvents = 'none';
        }
        
        fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: `action=delete&name=${encodeURIComponent(name)}`
        })
        .then(res => res.json())
        .then(data => {
            const elapsed = Date.now() - startTime;
            const delay = Math.max(0, minLoaderTime - elapsed);
            
            setTimeout(() => {
                if (data.success) {
                    // Reload documents list
                    loadDocuments();
                } else {
                    alert(`${ __('error_deleting_document')}` + data.message);
                    if (targetCard) {
                        targetCard.style.opacity = '1';
                        targetCard.style.pointerEvents = 'auto';
                    }
                }
            }, delay);
        })
        .catch(error => {
            const elapsed = Date.now() - startTime;
            const delay = Math.max(0, minLoaderTime - elapsed);
            
            setTimeout(() => {
                alert(`${__('error_deleting_document')}`);
                if (targetCard) {
                    targetCard.style.opacity = '1';
                    targetCard.style.pointerEvents = 'auto';
                }
            }, delay);
        });
    }
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

function deleteFile(path) {
    if (confirm(__('confirm_delete_file'))) {
        console.log('Delete file:', path);
    }
}

function shareFile(path) {
    console.log('Share file:', path);
}