(function () {
    const section = document.getElementById('comment-section');
    if (!section) return;

    const postId = section.dataset.postId;
    const form = document.getElementById('comment-form');
    const commentList = section.querySelectorAll('.comment-block');

    function api(path, options = {}) {
        const url = `/api/posts/${postId}/comments${path}`;
        return fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('comment-content-input');
            const content = input && input.value ? input.value.trim() : '';
            if (!content) return;

            const btn = form.querySelector('#send-comment-button');
            if (btn) btn.disabled = true;

            try {
                const res = await api('', {
                    method: 'POST',
                    body: JSON.stringify({ content })
                });
                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    input.value = '';
                    appendComment(data);
                    const noComment = document.getElementById('no-comment-paragraph');
                    if (noComment) noComment.remove();
                } else {
                    alert(data.error || 'Failed to post comment.');
                }
            } catch (_) {
                alert('Failed to post comment.');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    function appendComment(comment) {
        const block = document.createElement('div');
        block.className = 'comment-block';
        block.dataset.commentId = comment.id;
        block.dataset.commentUserId = comment.userID || '';
        const date = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        block.innerHTML = `
            <div class="comment-header">
                <h3>${escapeHtml(comment.author)}</h3>
                <span class="comment-time">${escapeHtml(date)}</span>
                <div class="comment-actions">
                    <button type="button" class="comment-edit-btn" title="Edit comment">Edit</button>
                    <button type="button" class="comment-delete-btn" title="Delete comment">Delete</button>
                </div>
            </div>
            <p class="comment-content">${escapeHtml(comment.content)}</p>
        `;
        const insertRef = form || section.querySelector('#comment-login-prompt') || section.querySelector('#comments-section');
        insertRef.insertAdjacentElement('afterend', block);
        block.querySelector('.comment-edit-btn').addEventListener('click', () => editComment(block));
        block.querySelector('.comment-delete-btn').addEventListener('click', () => deleteComment(block));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function editComment(block) {
        const commentId = block.dataset.commentId;
        const contentEl = block.querySelector('.comment-content');
        const originalText = contentEl.textContent;

        const formWrap = document.createElement('div');
        formWrap.className = 'comment-edit-form';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'comment-edit-input';

        const actions = document.createElement('div');
        actions.className = 'comment-edit-actions';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.textContent = 'Save';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';

        function cleanup() {
            formWrap.remove();
            contentEl.style.display = '';
        }

        saveBtn.addEventListener('click', async () => {
            const newContent = input.value.trim();
            if (newContent === originalText) {
                cleanup();
                return;
            }
            if (!newContent) return;

            saveBtn.disabled = true;
            try {
                const res = await api(`/${commentId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ content: newContent })
                });
                if (res.ok) {
                    contentEl.textContent = newContent;
                    cleanup();
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(data.error || 'Failed to update comment.');
                }
            } catch (_) {
                alert('Failed to update comment.');
            } finally {
                saveBtn.disabled = false;
            }
        });

        cancelBtn.addEventListener('click', cleanup);

        actions.append(saveBtn, cancelBtn);
        formWrap.append(input, actions);
        contentEl.style.display = 'none';
        contentEl.after(formWrap);
    }

    function deleteComment(block) {
        const commentId = block.dataset.commentId;
        if (!confirm('Delete this comment?')) return;

        api(`/${commentId}`, { method: 'DELETE' })
            .then((res) => {
                if (res.ok) {
                    block.remove();
                    const remaining = section.querySelectorAll('.comment-block');
                    const noComment = document.getElementById('no-comment-paragraph');
                    if (remaining.length === 0 && !noComment) {
                        const p = document.createElement('p');
                        p.id = 'no-comment-paragraph';
                        p.textContent = 'No comments yet. Be the first to start the conversation!';
                        section.appendChild(p);
                    }
                } else {
                    return res.json().then((data) => {
                        alert(data.error || 'Failed to delete comment.');
                    });
                }
            })
            .catch(() => alert('Failed to delete comment.'));
    }

    commentList.forEach((block) => {
        block.querySelectorAll('.comment-edit-btn').forEach((btn) => {
            btn.addEventListener('click', () => editComment(block));
        });
        block.querySelectorAll('.comment-delete-btn').forEach((btn) => {
            btn.addEventListener('click', () => deleteComment(block));
        });
    });
})();
