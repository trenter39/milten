import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV
} from '../config/conf.js';

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
            return res.status(400).json({ error: 'Email must be 3-50 characters.' });
        }
        if (password.length < 6 || password.length > 30) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const [existing] = await db.query(
            'select id from users where email = ? limit 1',
            [email]
        );
        if (existing.length) {
            return res.status(409).json({ error: 'Email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await db.query(
            'insert into users(first_name, last_name, email, passwordHash, role) values(?, ?, ?, ?, ?)',
            [firstName, lastName, email, passwordHash, 'user']
        );

        return res.status(201).json({ message: 'User registered sucessfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Registration failed.' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password.' });
        }

        const [rows] = await db.query(
            `select id, first_name, last_name, email, passwordHash, role
            from users
            where email = ?
            limit 1`,
            [email]
        );

        if (!rows.length) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, firstName: user.first_name,
                lastName: user.last_name, email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        setAuthCookie(res, token);
        res.status(200).json({
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
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed.' });
    }
}

export async function logout(req, res) {
    clearAuthCookie(res);
    return res.status(204).send();
}

export async function me(req, res) {
    return res.status(200).json({ user: req.user || null });
}