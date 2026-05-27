
document.addEventListener('DOMContentLoaded', function() {

      const foldersContainer = document.querySelector('.recent-folders .folders-list');
    const filesContainer = document.querySelector('.recent-files .files-grid');
    
    if (foldersContainer) {
        foldersContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                <div class="loader-spinner"></div>
                <span style="margin-left: 10px;">${__('loading')}</span>
            </div>
        `;
    }
    
    if (filesContainer) {
        filesContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                <div class="loader-spinner"></div>
                <span style="margin-left: 10px;">${__('loading')}</span>
            </div>
        `;
    }
    
    const minLoaderTime = 100;
    const startTime = Date.now();
    
    fetch('/Datahub/Handlers/UploadHandler.php', {
        method: 'POST',
        headers: {'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'action=get_recent_items'
    })
    .then(res => res.json())
    .then(data => {
        
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);

        setTimeout(() => {
          if (!data.success) {
                if (foldersContainer) foldersContainer.innerHTML = `<div class="empty-message">${__('error_loading_folders')}</div>`;
                if (filesContainer) filesContainer.innerHTML = `<div class="empty-message">${__('error_loading_files')}</div>`;
                return;
            }
        let foldersHtml = '';
        data.recent_folders.forEach(folder => {
            foldersHtml += `
                <div class="folder-card" onclick="window.location.href='/Datahub/Dashboard/Uploads.php'; sessionStorage.setItem('redirectFolder', '${folder.path}')">
                    <i class="ri-folder-line"></i>
                    <span class="folder-name">${folder.name}</span>
                    <small>${folder.modified_formatted}</small>
                </div>
            `;
        });
        document.querySelector('.recent-folders .folders-list').innerHTML = foldersHtml || `<div class="empty-message">${__('no_folders_yet')}</div>`;
        
        let filesHtml = '';
        data.recent_files.forEach(file => {
            const viewAction = file.is_document ? `window.open('/Datahub/Dashboard/editor.php?doc=${encodeURIComponent(file.name.replace('.html', ''))}', '_blank')`
                            : `fileManager.previewFile('${file.path}'); sessionStorage.setItem('previewFile', '${file.path}')`;
            filesHtml += `
                <div class="file-card">
                    <div class="file-icon"><i class="ri-file-fill"></i></div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${file.size_formatted}</div>
                    <div class="file-actions">
                    <button class="preview-btn" onclick="${viewAction}"><i class="ri-eye-line"></i></button>
                    <a href="/Datahub/Handlers/UploadHandler.php?download=1&path=${encodeURIComponent(file.path)}" download onclick="event.stopPropagation()"><i class="ri-download-line"></i></a>
                    <button class="delete-btn" onclick="fileManager.deleteItem('${file.path}', false)"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </div>
            `;
        });
        document.querySelector('.recent-files .files-grid').innerHTML = filesHtml || `<div class="empty-message">${__('no_files_yet')}</div>`;
        
        }, delay)
    });

});