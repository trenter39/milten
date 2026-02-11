const searchForm = document.getElementById('search-form');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        const searchInput = document.getElementById('search-input');
        if (searchInput && !searchInput.value.trim()) {
            e.preventDefault();
            window.location.href = '/';
        }
    });
}

const clearSearchLink = document.getElementById('clear-search-link');
if (clearSearchLink) {
    clearSearchLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/';
    });
}