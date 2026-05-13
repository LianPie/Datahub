<?php
include 'includes/header.php';
?>

<div class="dashboard-content">
    
    <div class="recent-folders">
        <h3><i class="ri-folder-line"></i> Recent Folders</h3>
        <div class="folders-list">
                    <div class="folder-card" data-folder-id="">
                        <i class="ri-folder-line"></i>
                        <span class="folder-name"></span>
                        <!-- <small> folder date </small> -->
                    </div>
        </div>
    </div>

    <div class="recent-files">
        <h3><i class="ri-file-line"></i> Recently Uploaded Files</h3>
        <div class="files-grid">
                    <div class="file-card">
                        <div class="file-icon"></div>
                        <div class="file-name"></div>
                        <div class="file-size">X KB</div>
                        <div class="file-actions">
                            <button class="preview-btn" data-path="#" data-type="#"><i class="ri-eye-line"></i></button>
                            <a href="#" download><i class="ri-download-line"></i></a>
                            <button class="delete-btn" data-id="#"><i class="ri-delete-bin-line"></i></button>
                                <button class="share-btn" data-id="#"><i class="ri-share-line"></i></button>
                                <a href="#" target="_blank"><i class="ri-links-line"></i></a>
                        </div>
                    </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>