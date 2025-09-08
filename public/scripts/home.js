const sortSelect = document.getElementById('sortSelect');
const postList = document.getElementById('postList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearch = document.getElementById("clearSearchButton");
const noResults = document.getElementById("noResults");
const resultText = document.getElementById('resultText');
const postHeaders = document.querySelectorAll('.postHeading');

sortSelect.addEventListener("change", () => {
    const posts = Array.from(postList.querySelectorAll('.post'));
    posts.sort((a, b) => {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);

        return sortSelect.value === "newest"
            ? dateB - dateA
            : dateA - dateB;
    });

    posts.forEach(post => postList.appendChild(post));
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase().trim();
    const posts = Array.from(postList.querySelectorAll('.post'));
    let found = false;

    posts.forEach(post => {
        const header = post.querySelector(".postHeading");
        if (!header) return;
        const title = header.textContent.toLowerCase();
        if (title.includes(query)) {
            post.style.display = "";
            found = true;
        } else {
            post.style.display = "none";
        }
    });
    if (found) { noResults.style.display = "none"; } else {
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