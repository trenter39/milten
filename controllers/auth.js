import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from '../config/conf.js';
import {
    ok,
    created,
    noContent,
    badRequest,
    unauthorized,
    conflict,
    internalServerError,
} from '../utils/httpResponses.js';
import {
    validateRequiredFields,
    validateEmail,
    validatePassword,
} from '../utils/fieldValidator.js';

export function setAuthCookie(res, token) {
    const maxAge = 1000 * 60 * 60 * 24;
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: NODE_ENV === 'production',
        maxAge,
    });
}

export function clearAuthCookie(res) {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: NODE_ENV === 'production',
    });
}

export function createAuthToken(user) {
    return jwt.sign(
        {
            id: user.id,
            firstName: user.first_name ?? user.firstName,
            lastName: user.last_name ?? user.lastName,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export async function register(req, res) {
    try {
        const missingFields = validateRequiredFields(req.body || {}, [
            'firstName',
            'lastName',
            'email',
            'password',
        ]);

        if (missingFields) return badRequest(res, missingFields);

        const { firstName, lastName, email, password } = req.body;
        const firstNameValue = firstName.trim();
        const lastNameValue = lastName.trim();
        const emailValue = email.trim();

        const emailError = validateEmail(emailValue);
        if (emailError) {
            return badRequest(res, emailError);
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return badRequest(res, passwordError);
        }

        const [existing] = await db.query('select id from users where email = ? limit 1', [email]);
        if (existing.length) {
            return conflict(res, 'Email already exists');
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            'insert into users(first_name, last_name, email, passwordHash, role) values(?, ?, ?, ?, ?)',
            [firstName, lastName, email, passwordHash, 'user']
        );

        if (result.insertId === 1) {
            await db.query('update users set role = "admin" where id = 1');
        }

        return created(res, {
            message: 'User registered sucessfully',
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function login(req, res) {
    try {
        const missingFields = validateRequiredFields(req.body || {}, ['email', 'password']);

        if (missingFields) return badRequest(res, missingFields);

        const { email, password } = req.body;
        const emailValue = email.trim();

        const emailError = validateEmail(emailValue);
        if (emailError) {
            return badRequest(res, emailError);
        }

        const [rows] = await db.query(
            `select id, first_name, last_name, email, passwordHash, role
            from users
            where email = ?
            limit 1`,
            [email]
        );

        if (!rows.length) return unauthorized(res, 'Invalid credentials');

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) return unauthorized(res, 'Invalid credentials');

        const token = createAuthToken(user);
        setAuthCookie(res, token);

        ok(res, {
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role || 'user',
            },
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function logout(req, res) {
    clearAuthCookie(res);
    return noContent(res);
}

export async function getCurrentUser(req, res) {
    if (!req.user) {
        return ok(res, { user: null });
    }

    return ok(res, {
        user: {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role,
        },
    });
}
