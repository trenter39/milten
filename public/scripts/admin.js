document.querySelector('#post-list').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-button')) {
        const btn = e.target;
        const postID = btn.dataset.id;
        const postBlock = btn.closest('.post');
        const originalHTML = postBlock.innerHTML;
        postBlock.innerHTML = `
            <div class="confirm-delete">
                <button class="confirm-delete-btn"><h2>Delete this post!</h2></button>
                <button class="cancel-delete-btn"><h2>Don't delete this post!</h2></button>
            </div>
        `;

        postBlock.querySelector('.confirm-delete-btn').addEventListener('click', async () => {
            const res = await fetch(`/api/posts/${postID}`, { method: 'delete' });
            if (res.ok) {
                postBlock.remove();
            } else {
                alert("Failed to delete post!");
            }
        });

        postBlock.querySelector('.cancel-delete-btn').addEventListener('click', () => {
            postBlock.innerHTML = originalHTML;
        });

    }
});