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