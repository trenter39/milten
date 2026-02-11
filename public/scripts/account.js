const logoutBtn = document.getElementById('account-logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error(err);
        } finally {
            window.location.href = '/';
        }
    });
}

const usersTable = document.getElementById('admin-users');
if (usersTable) {
    usersTable.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-user-btn')) {
            const btn = e.target;
            const userId = btn.dataset.id;
            const row = btn.closest('tr');
            const original = row.innerHTML;

            if (btn.dataset.self === 'true') return;

            row.innerHTML = `
                <td colspan="4">
                    <div class="confirm-delete">
                        <button class="confirm-delete-user">Yes, I want to delete user</button>
                        <button class="cancel-delete-user">No, I don't want to delete user</button>
                    </div>
                </td>
            `;

            row.querySelector('.confirm-delete-user').addEventListener('click', async () => {
                try {
                    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
                    if (res.ok) {
                        row.remove();
                    } else {
                        alert('Failed to delete user');
                        row.innerHTML = original;
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error deleting user');
                    row.innerHTML = original;
                }
            });

            row.querySelector('.cancel-delete-user').addEventListener('click', () => {
                row.innerHTML = original;
            });
        }
    });
}
