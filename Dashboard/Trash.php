<?php
include 'includes/header.php';
require_once __DIR__ . '/../Database/DbConfig.php';

$user_id = $_SESSION['user_id'];

// دریافت فایل‌های حذف شده
$stmt = $conn->prepare("SELECT * FROM files WHERE user_id = ? AND is_deleted = 1 ORDER BY uploaded_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$deletedFiles = $result->fetch_all(MYSQLI_ASSOC);
?>

<div class="dashboard-content">
    <h2><i class="ri-delete-bin-line"></i> <?= __('trash') ?></h2>
    
    <div class="files-section">
        <?php if (count($deletedFiles) === 0): ?>
            <div class="empty-trash">
                <i class="ri-delete-bin-7-line"></i>
                <p><?= __('trash_empty') ?></p>
            </div>
        <?php else: ?>
            <div class="files-grid">
                <?php foreach ($deletedFiles as $file): ?>
                    <div class="file-card" data-file-id="<?= $file['id'] ?>">
                        <div class="file-icon">
                            <?php
                            $ext = pathinfo($file['filename'], PATHINFO_EXTENSION);
                            if (in_array($ext, ['jpg','png','gif'])) echo '<i class="ri-image-line"></i>';
                            elseif ($ext == 'pdf') echo '<i class="ri-file-pdf-line"></i>';
                            elseif (in_array($ext, ['mp4','avi','mkv'])) echo '<i class="ri-movie-line"></i>';
                            else echo '<i class="ri-file-copy-line"></i>';
                            ?>
                        </div>
                        <div class="file-name"><?= htmlspecialchars($file['filename']) ?></div>
                        <div class="file-size"><?= round($file['filesize'] / 1024, 2) ?> KB</div>
                        <div class="file-actions">
                            <button class="restore-btn" data-id="<?= $file['id'] ?>">
                                <i class="ri-restart-line"></i>
                            </button>
                            <button class="permanent-delete-btn" data-id="<?= $file['id'] ?>">
                                <i class="ri-delete-bin-7-line"></i>
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Custom confirmation modal (shared) -->
<div id="confirmModal" class="custom-modal confirm-modal" style="display: none;">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h3 id="confirmTitle">Confirm Action</h3>
            <span class="modal-close" onclick="closeConfirmModal()">&times;</span>
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
<script src="/Datahub/assets/js/trash.js"></script>