const postList = document.getElementById('post-list');
if (postList) {
    postList.addEventListener('click', async (e) => {
        if (e.target.closest('.menu-button')) {
            e.stopPropagation();
            const button = e.target.closest('.menu-button');
            const menu = button.nextElementSibling;
            
            document.querySelectorAll('.menu.open').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('open');
                }
            });
            
            menu.classList.toggle('open');
        }
        
        if (e.target.classList.contains('delete-button') && e.target.dataset.id) {
            e.preventDefault();
            e.stopPropagation();
            
            const btn = e.target;
            const postID = btn.dataset.id;
            const postBlock = btn.closest('.post');
            const originalHTML = postBlock.innerHTML;
            
            postBlock.innerHTML = `
                <div class="confirm-delete">
                    <button class="confirm-delete-btn"><span>Delete this post!</span></button>
                    <button class="cancel-delete-btn"><span>Don't delete this post!</span></button>
                </div>
            `;

            postBlock.querySelector('.confirm-delete-btn').addEventListener('click', async () => {
                try {
                    const res = await fetch(`/api/posts/${postID}`, { method: 'DELETE' });
                    if (res.ok) {
                        window.location.reload();
                    } else {
                        alert("Failed to delete post!");
                        postBlock.innerHTML = originalHTML;
                    }
                } catch (err) {
                    console.error(err);
                    alert("Error deleting post!");
                    postBlock.innerHTML = originalHTML;
                }
            });

            postBlock.querySelector('.cancel-delete-btn').addEventListener('click', () => {
                postBlock.innerHTML = originalHTML;
            });
        }
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrapper')) {
        document.querySelectorAll('.menu.open').forEach(menu => {
            menu.classList.remove('open');
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.closest('.menu a') || (e.target.closest('.menu button') && !e.target.closest('.menu-button'))) {
        const menu = e.target.closest('.menu');
        if (menu) {
            menu.classList.remove('open');
        }
    }
});