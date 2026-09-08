const postList = document.getElementById('post-list');
if (postList) {
    // Modal HTML injection if not present
    if (!document.getElementById('modal-confirm')) {
        const modal = document.createElement('div');
        modal.id = 'modal-confirm';
        modal.className = 'modal-confirm-overlay';
        modal.innerHTML = `
            <div class="modal-confirm-window">
                <h2 class="modal-confirm-title"></h2>
                <p class="modal-confirm-desc"></p>
                <div class="modal-confirm-actions" style="margin-top: 0px;">
                    <button class="modal-cancel-btn">Cancel</button>
                    <button class="modal-delete-btn">Delete</button>
                </div>
            </div>
        `;
        modal.style.display = 'none';
        document.body.appendChild(modal);
    }

    function showModal({ title, desc, onDelete }) {
        const modal = document.getElementById('modal-confirm');
        modal.querySelector('.modal-confirm-title').textContent = title;
        modal.querySelector('.modal-confirm-desc').textContent = desc;
        modal.style.display = 'flex';
        const cancelBtn = modal.querySelector('.modal-cancel-btn');
        const deleteBtn = modal.querySelector('.modal-delete-btn');

        function cleanup() {
            modal.style.display = 'none';
            cancelBtn.removeEventListener('click', onCancel);
            deleteBtn.removeEventListener('click', onDeleteClick);
        }
        function onCancel() {
            cleanup();
        }
        async function onDeleteClick() {
            await onDelete();
            cleanup();
        }
        cancelBtn.addEventListener('click', onCancel);
        deleteBtn.addEventListener('click', onDeleteClick);
    }

    postList.addEventListener('click', async (e) => {
        if (e.target.closest('.menu-button')) {
            e.stopPropagation();
            const button = e.target.closest('.menu-button');
            const menu = button.nextElementSibling;
            document.querySelectorAll('.menu.open').forEach((m) => {
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
            showModal({
                title: 'Delete post?',
                desc: 'All of its content will be removed. Do you want to delete this?',
                onDelete: async () => {
                    try {
                        const res = await fetch(`/api/posts/${postID}`, { method: 'DELETE' });
                        if (res.ok) {
                            window.location.reload();
                        } else {
                            alert('Failed to delete post!');
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Error deleting post!');
                    }
                },
            });
        }
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrapper')) {
        document.querySelectorAll('.menu.open').forEach((menu) => {
            menu.classList.remove('open');
        });
    }
});

document.addEventListener('click', (e) => {
    if (
        e.target.closest('.menu a') ||
        (e.target.closest('.menu button') && !e.target.closest('.menu-button'))
    ) {
        const menu = e.target.closest('.menu');
        if (menu) {
            menu.classList.remove('open');
        }
    }
});
