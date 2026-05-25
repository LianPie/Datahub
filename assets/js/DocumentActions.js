// ==================== GLOBAL VARIABLES ====================
const baseUrl = '/Datahub/Handlers/documentHandler.php';
let currentDocName = '';

// ==================== HELPER FUNCTIONS ====================
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== DOCUMENT FUNCTIONS ====================
function viewDocument(name) {
    window.open(`editor.php?doc=${encodeURIComponent(name)}`, '_blank');
}

function editDocument(name) {
    window.location.href = `editor.php?action=edit&name=${encodeURIComponent(name)}`;
}

// ==================== SUMMERNOTE DROPDOWN FIX ====================
$(document).ready(function() {
    $(document).on('click', '.note-btn.dropdown-toggle', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this);
        var $parent = $this.closest('.note-btn-group');
        if ($parent.hasClass('open')) {
            $parent.removeClass('open');
            $parent.find('.dropdown-menu').hide();
        } else {
            $('.note-btn-group.open').removeClass('open');
            $('.note-btn-group .dropdown-menu').hide();
            $parent.addClass('open');
            $parent.find('.dropdown-menu').show();
        }
    });
    
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.note-btn-group').length) {
            $('.note-btn-group.open').removeClass('open');
            $('.note-btn-group .dropdown-menu').hide();
        }
    });
});

// ==================== LOAD FUNCTIONS ====================
function loadDocumentForEdit(name) {
    currentDocName = name;
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('editorMode').style.display = 'none';
    document.getElementById('viewMode').style.display = 'none';
    
    fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: `action=load&name=${encodeURIComponent(name)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('editorMode').style.display = 'block';
            document.getElementById('docName').value = name;
            initSummernote(data.content);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        showError(__('error_loading_document'));
    });
}

function loadDocumentForView(name) {
    currentDocName = name;
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('editorMode').style.display = 'none';
    document.getElementById('viewMode').style.display = 'none';
    
    fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: `action=load&name=${encodeURIComponent(name)}`
    })

    .then(res => res.json())
    .then(data => {
        if (data.success && data.content) {

            document.getElementById('loader').style.display = 'none';
            document.getElementById('viewMode').style.display = 'block';
            document.getElementById('viewTitle').innerHTML = `<i class="ri-file-text-line"></i> ${escapeHtml(name)}`;
            
            let content = data.content;
            if (content.includes('<body')) {
                const match = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                if (match) content = match[1];
            }
            content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            document.getElementById('viewContent').innerHTML = content;
        } else {
            showError(data.message || __('error_loading_document'));
        }
    })
    .catch(error => {
        showError(__('error_loading_document'));
    });
}

// ==================== SAVE FUNCTION ====================
function saveDocument() {
    const name = document.getElementById('docName').value.trim();
    if (!name) {
        showError(__('enter_document_name'));
        return;
    }
    
    const content = $('#summernote').summernote('code');
    
    fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: `action=save&name=${encodeURIComponent(name)}&content=${encodeURIComponent(content)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage(__('document_saved'), 'success');
            window.location.href = `editor.php?doc=${encodeURIComponent(name)}`;
        } else {
            showError(__('error_saving_document') + ' ' + data.message);
        }
    })
    .catch(error => {
        showError(__('error_saving_document'));
    });
}

// ==================== SUMMERNOTE FUNCTIONS ====================
function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('action', 'upload_image');
    
    fetch(baseUrl, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log(data)
            $('#summernote').summernote('insertImage', data.url);
        } else {
            showError(__('error_uploading_image') + ' ' + data.message);
        }
    })
    .catch(error => {
        showError(__('error_uploading_image'));
    });
}

function initSummernote(content) {
    if (!$('#summernote').length) {
        console.error('Summernote element not found');
        return;
    }
    
    if ($('#summernote').hasClass('note-editor')) {
        $('#summernote').summernote('destroy');
    }
    
    $('#summernote').summernote({
        height: 400,
        minHeight: 350,
        placeholder: __('type_here'),
        lang: (typeof __('lan') !== 'undefined' && __('lan') == 'fa') ? 'fa-IR' : 'en-US',
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video', 'hr']],
            ['view', ['codeview', 'help']]
        ],
        fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '40', '48', '60'],
        fontNames: [
            'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
            'Impact', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
            'IRANSans', 'Tahoma', 'B Nazanin', 'Yekan'
        ],
        fontNamesIgnoreCheck: ['IRANSans', 'B Nazanin', 'Yekan'],
        callbacks: {
            onImageUpload: function(files) {
                uploadImage(files[0]);
            }
        }
    });
    
    if (content) {
        $('#summernote').summernote('code', content);
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    
    if (saveBtn) {
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.onclick = saveDocument;
    }
    
    if (viewToggleBtn) {
        const newViewBtn = viewToggleBtn.cloneNode(true);
        viewToggleBtn.parentNode.replaceChild(newViewBtn, viewToggleBtn);
        newViewBtn.onclick = function() {
            const name = document.getElementById('docName').value.trim();
            const content = $('#summernote').summernote('code');
            if (name) {
                localStorage.setItem('tempContent', content);
                window.location.href = `editor.php?doc=${encodeURIComponent(name)}`;
            } else {
                alert('لطفا نام سند را وارد کنید');
            }
        };
    }
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const docName = urlParams.get('doc');
    const action = urlParams.get('action');
    
    if (action === 'edit' && docName) {
        loadDocumentForEdit(docName);
    } else if (docName) {
        loadDocumentForView(docName);
    } else {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('editorMode').style.display = 'block';
        initSummernote('');
        document.getElementById('docName').value = '';
    }
});

document.getElementById('editToggleBtn')?.addEventListener('click', function() {
    const content = document.getElementById('viewContent').innerHTML;
    const name = currentDocName;
    localStorage.setItem('tempContent', content);
    window.location.href = `editor.php?action=edit&doc=${encodeURIComponent(name)}`;
});