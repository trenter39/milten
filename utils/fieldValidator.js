export function validateRequiredFields(body, fields) {
    for (const field of fields) {
        const value = body[field];
        if (!value || typeof value !== 'string' || !value.trim()) {
            return `Field ${field} is required`;
        }
    }
    return null;
}

export function validateMaxLength(body, fields) {
    for (const [field, maxLength] of Object.entries(fields)) {
        if (body[field].trim().length > maxLength) {
            return `Field ${field} must be ${maxLength} characters or fewer`;
        }
    }
    return null;
}

export function validateEmail(email) {
    const trimmedEmail = email.trim();
    const emailRegex =
        /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    const atIndex = trimmedEmail.indexOf('@');
    const localPartLength = atIndex > 0 ? atIndex : 0;

    if (trimmedEmail.length > 254 || localPartLength > 64 || !emailRegex.test(trimmedEmail)) {
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
