const sortSelect = document.getElementById('sort-select');
const postList = document.getElementById('post-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const clearSearch = document.getElementById("clear-search-button");
const noResults = document.getElementById("no-results");
const resultText = document.getElementById('result-text');

sortSelect.addEventListener("change", () => {
    const posts = Array.from(postList.querySelectorAll('.post'));
    posts.sort((a, b) => {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);

        return sortSelect.value === "newest" ? dateB - dateA : dateA - dateB;
    });

    posts.forEach(post => postList.appendChild(post));
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase().trim();
    const posts = Array.from(postList.querySelectorAll('.post'));
    let found = false;

    posts.forEach(post => {
        const header = post.querySelector(".post-title");
        if (!header) return;

        const title = header.textContent.toLowerCase();
        if (title.includes(query)) {
            post.style.display = "";
            found = true;
        } else {
            post.style.display = "none";
        }
    });
    if (found) {
        noResults.style.display = "none";
    } else {
        noResults.style.display = "block";
        resultText.textContent = `No posts found for "${query}"!`;
    }
});

clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    const posts = Array.from(postList.querySelectorAll(".post"));
    posts.forEach(post => post.style.display = "");
    noResults.style.display = "none";
});