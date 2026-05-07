function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '';
    if (type === 'success') icon = '<i class="ri-checkbox-circle-line"></i>';
    else if (type === 'error') icon = '<i class="ri-alert-line"></i>';
    else icon = '<i class="ri-information-line"></i>';

    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
        <i class="ri-close-line toast-close"></i>
        <div class="toast-progress"></div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        closeToast(toast);
    });

    toast.addEventListener('click', (e) => {
        if (e.target === toast || e.target.classList.contains('toast-close')) {
            closeToast(toast);
        }
    });

    const timeout = setTimeout(() => closeToast(toast), 3000);

    toast.addEventListener('mouseenter', () => clearTimeout(timeout));
    toast.addEventListener('mouseleave', () => {
    });

    function closeToast(toastElement) {
        if (!toastElement) return;
        toastElement.classList.remove('show');
        setTimeout(() => toastElement.remove(), 300);
    }
}