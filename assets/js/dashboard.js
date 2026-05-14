
const folderModal = document.getElementById('folderModal');
const uploadModal = document.getElementById('uploadModal');
const newFolderBtn = document.getElementById('newFolderBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const closeBtns = document.querySelectorAll('.modal-close, .modal-btn.cancel');

function openModal(modal) {
    modal.style.display = 'flex';
}
function closeModal(modal) {
    modal.style.display = 'none';
}

closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        folderModal.style.display = 'none';
        uploadModal.style.display = 'none';
    });
});
window.addEventListener('click', (e) => {
    if (e.target === folderModal) folderModal.style.display = 'none';
    if (e.target === uploadModal) uploadModal.style.display = 'none';
});
if (newFolderBtn) newFolderBtn.addEventListener('click', () => openModal(folderModal));
if (uploadFileBtn) uploadFileBtn.addEventListener('click', () => openModal(uploadModal));
