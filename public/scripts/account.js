import { formatDate } from './dateFormatter.js';

async function getErrorMessage(response, fallback) {
    try {
        const body = await response.json();
        return body?.error || fallback;
    } catch (_) {
        return fallback;
    }
}

function setFormError(element, message) {
    element.textContent = message || '';
    element.style.display = message ? 'block' : 'none';
}

function escapeHtml(text) {
    const element = document.createElement('div');
    element.textContent = text;
    return element.innerHTML;
}

const accountActions = document.querySelector('.account-actions');
const profileData = {
    firstName: accountActions.dataset.firstName,
    lastName: accountActions.dataset.lastName,
    email: accountActions.dataset.email,
};

const accountModal = document.getElementById('account-modal');
const accountModalTitle = document.getElementById('account-modal-title');
const accountModalDesc = document.getElementById('account-modal-desc');
const accountModalBody = document.getElementById('account-modal-body');
const accountModalError = document.getElementById('account-modal-error');
const accountModalCancel = document.getElementById('account-modal-cancel');
const accountModalConfirm = document.getElementById('account-modal-confirm');
let accountModalAction = null;

function closeAccountModal() {
    accountModal.style.display = 'none';
    accountModalBody.innerHTML = '';
    accountModalAction = null;
    setFormError(accountModalError, '');
}

function openAccountModal({ title, desc, body = '', confirmText, action }) {
    accountModalTitle.textContent = title;
    accountModalDesc.textContent = desc;
    accountModalBody.innerHTML = body;
    accountModalConfirm.textContent = confirmText;
    accountModalAction = action;
    setFormError(accountModalError, '');
    accountModal.style.display = 'flex';
}

accountModalCancel.addEventListener('click', closeAccountModal);

accountModalConfirm.addEventListener('click', async () => {
    if (!accountModalAction) return;
    accountModalConfirm.disabled = true;
    setFormError(accountModalError, '');
    try {
        await accountModalAction();
    } catch (err) {
        console.error(err);
        setFormError(accountModalError, 'Network error. Please try again.');
    } finally {
        accountModalConfirm.disabled = false;
    }
});

document.getElementById('account-edit-profile').addEventListener('click', () => {
    openAccountModal({
        title: 'Edit profile',
        desc: 'Update your account information',
        confirmText: 'Save',
        body: `
            <label for="modal-first-name">First name</label>
            <input id="modal-first-name" type="text" value="${escapeHtml(profileData.firstName)}" required>
            <label for="modal-last-name">Last name</label>
            <input id="modal-last-name" type="text" value="${escapeHtml(profileData.lastName)}" required>
            <label for="modal-email">Email address</label>
            <input id="modal-email" type="email" value="${escapeHtml(profileData.email)}" required>
        `,
        action: async () => {
            const firstName = document.getElementById('modal-first-name').value.trim();
            const lastName = document.getElementById('modal-last-name').value.trim();
            const email = document.getElementById('modal-email').value.trim();
            const response = await fetch('/api/auth/me/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email }),
            });
            if (!response.ok) {
                setFormError(accountModalError, await getErrorMessage(response, 'Profile update failed.'));
                return;
            }
            window.location.reload();
        },
    });
});

document.getElementById('account-change-password').addEventListener('click', () => {
    openAccountModal({
        title: 'Change password',
        desc: 'Enter your previous password and choose a new one',
        confirmText: 'Change',
        body: `
            <label for="modal-previous-password">Previous password</label>
            <input id="modal-previous-password" type="password" required>
            <label for="modal-new-password">New password</label>
            <input id="modal-new-password" type="password" required>
        `,
        action: async () => {
            const previousPassword = document.getElementById('modal-previous-password').value;
            const password = document.getElementById('modal-new-password').value;
            const response = await fetch('/api/auth/me/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ previousPassword, password }),
            });
            if (!response.ok) {
                setFormError(accountModalError, await getErrorMessage(response, 'Password update failed.'));
                return;
            }
            closeAccountModal();
        },
    });
});

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

const deleteBtn = document.getElementById('account-delete');
if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
        openAccountModal({
            title: 'Delete account?',
            desc: 'Enter your current password to delete your account. Your comments will remain anonymous.',
            confirmText: 'Delete',
            body: `
                <label for="modal-delete-password">Current password</label>
                <input id="modal-delete-password" type="password" required>
            `,
            action: async () => {
                const previousPassword = document.getElementById('modal-delete-password').value.trim();
                if (!previousPassword) {
                    setFormError(accountModalError, 'Current password is required.');
                    return;
                }
                const response = await fetch('/api/auth/me', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ previousPassword }),
                });
                if (!response.ok) {
                    setFormError(accountModalError, await getErrorMessage(response, 'Account deletion failed.'));
                    return;
                }
                window.location.href = '/';
            },
        });
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

document.querySelectorAll('.comment-time').forEach((element) => {
    const timeDate = element.dataset.time;
    if (timeDate) element.textContent = formatDate(timeDate);
});

const creationDate = document.getElementById('profile-creation-date');
if (creationDate && creationDate.dataset.time) {
    creationDate.textContent = formatDate(creationDate.dataset.time);
}
