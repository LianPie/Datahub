// upload and folder creation 
//TODO: delete 
class FileManagerActions extends FileManagerCore {
    constructor() {
        super();
        this.initConfirmModal();

    }
    
    // ---------- Custom confirmation modal (Promise-based) ----------
    initConfirmModal() {
        if (document.getElementById('customConfirmModal')) return;
        
        const modalHtml = `
            <div id="customConfirmModal" class="custom-modal confirm-modal" style="display: none;">
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h3 id="confirmTitle">Confirm Action</h3>
                        <span class="modal-close" onclick="window.fileManagerActions?.closeConfirmModal()">&times;</span>
                    </div>
                    <div class="custom-modal-body">
                        <p id="confirmMessage">Are you sure?</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button id="confirmCancelBtn" class="modal-btn cancel">Cancel</button>
                        <button id="confirmOkBtn" class="modal-btn confirm">Yes, Proceed</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        this.confirmResolver = null;
        
        // Bind events
        const modal = document.getElementById('customConfirmModal');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('confirmCancelBtn');
        const okBtn = document.getElementById('confirmOkBtn');
        
        const closeModal = () => {
            modal.style.display = 'none';
            if (this.confirmResolver) {
                this.confirmResolver(false);
                this.confirmResolver = null;
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (this.confirmResolver) {
                this.confirmResolver(true);
                this.confirmResolver = null;
            }
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Expose helper for manual closing (if needed)
        window.fileManagerActions = this;
        this.closeConfirmModal = closeModal;
    }
    
    async showConfirm(title, message, okText = 'Yes', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            const modal = document.getElementById('customConfirmModal');
            if (!modal) {
                // fallback to native confirm if modal somehow missing
                resolve(confirm(message));
                return;
            }
            
            document.getElementById('confirmTitle').innerText = title;
            document.getElementById('confirmMessage').innerHTML = message;
            document.getElementById('confirmOkBtn').innerText = okText;
            document.getElementById('confirmCancelBtn').innerText = cancelText;
            
            this.confirmResolver = resolve;
            modal.style.display = 'flex';
        });
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
            this.showError(__('please_enter_folder_name'));
            return;
        }
        if (!/^[a-zA-Z0-9_\-]+$/.test(folderName)) {
            this.showError(__('invalid_folder_name'));
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
                this.showMessage(__('folder_created_success'), 'success');
                this.closeModals();
                this.loadFolderContents(this.currentPath);
            } else {
                this.showError(data.message || __('failed_to_create_folder'));
            }
        } catch(e) {
            this.showError(__('failed_to_create_folder'));
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
            this.showError(__('please_select_file'));
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            this.showError(__('file_too_large'));
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'upload_file');
        formData.append('file', file);
        formData.append('subfolder', uploadPath);
        
        const confirmBtn = document.getElementById('confirmUploadBtn');
        const originalText = confirmBtn?.textContent || 'Upload';
        if (confirmBtn) {
            confirmBtn.textContent = __('uploading');
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
                this.showMessage(__('file_uploaded_success'), 'success');
                this.closeModals();
                
                this.redirectToUploadsPage();
                
                this.loadFolderContents(this.currentPath);
                this.loadStorageInfo();
            } else {
                this.showError(data.message);
            }
        } catch(e) {
            this.showError(__('failed_to_upload_file'));
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
                    let options = `<option value="">${__('root_no_folder')}</option>`;
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
        const typeText = isFolder ? __('delete_folder') : __('delete_file');
        const confirmMessage = isFolder ? __('confirm_delete_folder') : __('confirm_delete_file');

        const confirmed = await this.showConfirm(
            typeText,
            confirmMessage,
            __('move_to_trash'),
            __('cancel')
        );
        if (!confirmed) return;
                
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest'},
                body: new URLSearchParams({'action': 'delete_item', 'item_path': itemPath, 'is_folder': isFolder ? '1' : '0'})
            });
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (data.success) {
                this.showMessage(__('delete_success'), 'success');
                this.loadFolderContents(this.currentPath);
            } else {
                this.showError(__(data.message));
            }
        } catch(e) {
            this.showError(__('delete_failed'));
        }
    }

    previewFile(filePath) {
        const ext = filePath.split('.').pop().toLowerCase();
        const previewUrl = `${this.baseUrl}?download=1&path=${encodeURIComponent(filePath)}`;
        
        //image
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
        
        //video
        const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg'];
        
        //audio
        const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus'];
        
        // PDF
        const pdfExts = ['pdf'];
        
        // Create modal and loader
        const previewModal = document.createElement('div');
        previewModal.className = 'custom-modal';
        previewModal.style.display = 'flex';
        
        // Add loader HTML
        previewModal.innerHTML = `
            <div class="custom-modal-content" style="max-width: 90%; max-height: 90%; position: relative;">
                <div class="custom-modal-header">
                    <h3>${__('loading') || 'Loading...'}</h3>
                    <span class="modal-close" onclick="this.closest('.custom-modal').remove()">&times;</span>
                </div>
                <div class="custom-modal-body" style="text-align: center; min-height: 200px; display: flex; align-items: center; justify-content: center;">
                    <div class="loader-spinner"></div>
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);
        
        previewModal.addEventListener('click', (e) => { 
            if (e.target === previewModal) previewModal.remove(); 
        });
        
        const minLoaderTime = 100;
        const startTime = Date.now();
        
        if (imageExts.includes(ext)) {
            const img = new Image();
            
            img.onload = () => {
                const elapsed = Date.now() - startTime;
                const delay = Math.max(0, minLoaderTime - elapsed);
                
                setTimeout(() => {
                    previewModal.querySelector('.custom-modal-header h3').textContent = __('image_preview');
                    previewModal.querySelector('.custom-modal-body').innerHTML = `
                        <img src="${previewUrl}" style="max-width: 100%; max-height: 70vh;">
                    `;
                }, delay);
            };
            
            img.onerror = () => {
                const elapsed = Date.now() - startTime;
                const delay = Math.max(0, minLoaderTime - elapsed);
                
                setTimeout(() => {
                    previewModal.querySelector('.custom-modal-body').innerHTML = `
                        <div style="color: red; padding: 40px;">
                            <i class="ri-error-warning-line" style="font-size: 48px;"></i>
                            <p>${__('error_loading_image') || 'Failed to load image'}</p>
                        </div>
                    `;
                }, delay);
            };
            
            img.src = previewUrl;
        }
        else if (videoExts.includes(ext)) {
    const video = document.createElement('video');
    
    video.oncanplay = () => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            previewModal.querySelector('.custom-modal-header h3').textContent = __('video_player');
            previewModal.querySelector('.custom-modal-body').innerHTML = `
                <div style="position: relative;">
                    <video id="preview-video" controls autoplay style="max-width: 100%; max-height: 70vh;">
                        <source src="${previewUrl}" type="video/${ext === 'mp4' ? 'mp4' : ext === 'webm' ? 'webm' : 'ogg'}">
                        ${__('browser_no_video_support')}
                    </video>
                    <div class="skipbtns" style="text-align: center; margin-top: 10px;">
                        <button class="video-skip-btn" onclick="document.getElementById('preview-video').currentTime -= 10">⏪ -10s</button>
                        <button class="video-skip-btn" onclick="document.getElementById('preview-video').currentTime += 10">+10s ⏩</button>
                    </div>
                </div>
            `;
        }, delay);
    };
    
    video.onerror = () => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            previewModal.querySelector('.custom-modal-body').innerHTML = `
                <div style="color: red; padding: 40px;">
                    <i class="ri-error-warning-line" style="font-size: 48px;"></i>
                    <p>${__('error_loading_video') || 'Failed to load video'}</p>
                </div>
            `;
        }, delay);
    };
    
    video.src = previewUrl;
}

else if (audioExts.includes(ext)) {
    const audio = document.createElement('audio');
    
    audio.oncanplay = () => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            previewModal.querySelector('.custom-modal-header h3').textContent = __('music_player');
            previewModal.querySelector('.custom-modal-body').innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="ri-music-fill" style="font-size: 80px; color: #6c757d;"></i>
                    <p><strong>${this.escapeHtml(filePath.split('/').pop())}</strong></p>
                    <audio id="preview-audio" controls autoplay style="width: 100%;">
                        <source src="${previewUrl}" type="audio/${ext === 'mp3' ? 'mpeg' : ext === 'wav' ? 'wav' : 'ogg'}">
                        ${__('browser_no_audio_support')}
                    </audio>
                    <div class="skipbtns" style="text-align: center; margin-top: 10px;">
                        <button class="audio-skip-btn" onclick="document.getElementById('preview-audio').currentTime -= 10">⏪ -10s</button>
                        <button class="audio-skip-btn" onclick="document.getElementById('preview-audio').currentTime += 10">+10s ⏩</button>
                    </div>
                </div>
            `;
        }, delay);
    };
    
    audio.onerror = () => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);
        
        setTimeout(() => {
            previewModal.querySelector('.custom-modal-body').innerHTML = `
                <div style="color: red; padding: 40px;">
                    <i class="ri-error-warning-line" style="font-size: 48px;"></i>
                    <p>${__('error_loading_audio') || 'Failed to load audio'}</p>
                </div>
            `;
        }, delay);
    };
    
    audio.src = previewUrl;
}
        
        else if (pdfExts.includes(ext)) {
            const elapsed = Date.now() - startTime;
            const delay = Math.max(0, minLoaderTime - elapsed);
            
            setTimeout(() => {
                previewModal.querySelector('.custom-modal-header h3').textContent = __('pdf_preview');
                previewModal.querySelector('.custom-modal-body').innerHTML = `
                    <iframe src="${previewUrl}" style="width: 100%; height: 70vh;" frameborder="0"></iframe>
                `;
            }, delay);
        }
        
        else { 
            // Remove modal if it's not previewable
            previewModal.remove();
            
            if (confirm(window.__('cannot_preview_download'))) {
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