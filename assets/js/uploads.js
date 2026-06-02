document.addEventListener('DOMContentLoaded', function() {
    const clearIcon = document.getElementById('searchClearIcon');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.querySelector('.search-form');

    console.log('clearIcon:', clearIcon);
    console.log('searchInput:', searchInput);
    console.log('searchForm:', searchForm);

    if (clearIcon && searchInput && searchForm) {
        clearIcon.addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            searchForm.submit();
        });
    } else {
        console.error('یکی از عناصر جستجو پیدا نشد!');
    }
});