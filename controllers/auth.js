import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV
} from '../config/conf.js';
import {
    ok,
    created,
    noContent,
    badRequest,
    unauthorized,
    conflict,
    internalServerError
} from "../utils/APIHelper.js";

function setAuthCookie(res, token) {
    const maxAge = 1000 * 60 * 60 * 24;
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: NODE_ENV === 'production',
        maxAge
    });
}

function clearAuthCookie(res) {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: NODE_ENV === 'production'
    });
}

export async function register(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (email.length < 3 || email.length > 50) {
            return badRequest(res, 'Email must be 3-50 characters');
        }
        if (password.length < 6 || password.length > 30) {
            return badRequest(res, 'Password must be at least 6 characters');
        }

        const [existing] = await db.query(
            'select id from users where email = ? limit 1',
            [email]
        );
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
            message: 'User registered sucessfully'
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return badRequest(res, 'Missing email or password');
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

        const token = jwt.sign(
            {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        setAuthCookie(res, token);

        ok(res, {
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role || 'user'
            }
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function logout(req, res) {
    clearAuthCookie(res);
    return noContent(res);
}

export async function me(req, res) {
    return ok(res, { user: req.user || null });
}