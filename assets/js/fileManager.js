// fileManager.js - فایل اصلی
class FileManager extends FileManagerActions {
    constructor() {
        super();
        this.init();
    }
    
    async init() {
        this.bindEvents();

        if (this.isUploadsPage()) {
            await this.loadFolderContents();
            await this.loadStorageInfo();
            await this.loadFolderSelect();
        }
    }

     async openFolder(folderPath) {
        if (!this.isUploadsPage()) {
            sessionStorage.setItem('redirectAfterLogin', folderPath);
            window.location.href = '/Datahub/Dashboard/Uploads.php';
            return;
        }
        
        await super.openFolder(folderPath);
    }
    
    goBack() {
        if (!this.isUploadsPage()) {
            window.location.href = '/Datahub/Dashboard/Uploads.php';
            return;
        }
        
        super.goBack();
    }
}

// استایل‌ها
const style = document.createElement('style');
style.textContent = `
    .folder-card { cursor: pointer; transition: transform 0.2s; }
    .folder-card:hover { transform: translateY(-2px); }
    .back-btn { background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
    .empty-message { text-align: center; padding: 40px; color: #999; }
`;
document.head.appendChild(style);

// راه‌اندازی
let fileManager;
document.addEventListener('DOMContentLoaded', () => {
    fileManager = new FileManager();
    
    const uploadBtn = document.getElementById('uploadFileBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            setTimeout(() => {
                if (fileManager) fileManager.loadFolderSelect();
            }, 100);
        });
    }
});