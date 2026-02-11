const form = document.getElementById('login-form');
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
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    const submitBtn = form.querySelector('input[type="submit"]');
    submitBtn.disabled = true;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            let msg = 'Login failed.';
            try {
                const body = await res.json();
                if (body?.error) msg = body.error;
            } catch (_) {}
            setError(msg);
            return;
        }

        window.location.href = '/';
    } catch (err) {
        console.error(err);
        setError('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
    }
});

