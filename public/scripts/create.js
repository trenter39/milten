const form = document.getElementById('input-block');
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

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (String(data.title || '').length > 255) {
        setError('Title must be 255 characters or fewer.');
        return;
    }
    if (String(data.category || '').length > 100) {
        setError('Category must be 100 characters or fewer.');
        return;
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            let message = 'Failed to create post.';
            try {
                const body = await response.json();
                if (body?.error) message = body.error;
            } catch (_) {}
            setError(message);
        } else {
            window.location.href = '/';
        }
    } catch (err) {
        console.error(err);
        setError('Network error. Please try again.');
    }
});
