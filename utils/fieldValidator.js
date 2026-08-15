export function validateRequiredFields(body, fields) {
    for (const field of fields) {
        const value = body[field];
        if (!value || typeof value !== 'string' || !value.trim()) {
            return `Field ${field} is required`;
        }
    }
    return null;
}

export function validateEmail(email) {
    const trimmedEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmedEmail)) {
        return 'Please enter a valid email address.';
    }

    return null;
}

export function validatePassword(password) {
    const trimmedPassword = password.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(trimmedPassword)) {
        return 'Password must include at least 8 characters, one uppercase letter, one lowercase letter, and one digit.';
    }

    return null;
}
