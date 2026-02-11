const form = document.getElementById('register-form');
const errorEl = document.getElementById('form-error');

function setError(message) {
    if (!message) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
        return;
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError('');

    const formData = new FormData(form);
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }

    const submitBtn = form.querySelector('input[type="submit"]');
    submitBtn.disabled = true;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        if (!res.ok) {
            let msg = 'Registration failed.';
            try {
                const body = await res.json();
                if (body?.error) msg = body.error;
            } catch (_) {}
            setError(msg);
            return;
        }

        window.location.href = '/login';
    } catch (err) {
        console.error(err);
        setError('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
    }
});

