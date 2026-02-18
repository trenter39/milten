import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { fetchCommentsByUser } from './comments.js';
import {
    validateID,
    ok,
    created,
    noContent,
    badRequest,
    notFound,
    conflict,
    internalServerError
} from '../utils/APIHelper.js';

const ALLOWED_ROLES = ['user', 'admin'];

export async function createUser(req, res) {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return badRequest(res, 'Missing required fields');
        }

        if (role && !ALLOWED_ROLES.includes(role)) {
            return badRequest(res, 'Invalid role');
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
            `insert into users(first_name, last_name, email, passwordHash, role) 
            values (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, passwordHash, role]
        );

        return created(res, {
            id: result.insertId,
            firstName: result.first_name,
            lastName: result.last_name,
            email: result.email,
            role: result.role
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function updateUser(req, res) {
    try {
        const id = validateID(req.params.id);
        if (!id) return badRequest(res, 'Invalid ID');

        const { firstName, lastName, email, role, password } = req.body;

        if (role && !ALLOWED_ROLES.includes(role)) {
            return badRequest(res, 'Invalid role');
        }

        const fields = [];
        const values = [];

        if (firstName) {
            fields.push('first_name = ?');
            values.push(firstName);
        }

        if (lastName) {
            fields.push('last_name = ?');
            values.push(lastName);
        }

        if (email) {
            const [exists] = await db.query(
                `select id from users
                where email = ? and id != ?
                limit 1`,
                [email, id]
            );

            if (exists.length) {
                return conflict(res, 'Email already exists');
            }

            fields.push('email = ?');
            values.push(email);
        }

        if (role) {
            fields.push('role = ?');
            values.push(role);
        }

        if (password) {
            const hashed = await bcrypt.hash(password, 12);
            fields.push('password = ?');
            values.push(hashed);
        }

        if (!fields.length) {
            return badRequest(res, 'No fields to update');
        }

        values.push(id);

        const [result] = await db.query(
            `update users set ${fields.join(', ')} where id = ?`,
            values
        );

        if (!result.affectedRows) {
            return notFound(res, 'User not found');
        }

        return ok(res, { message: 'User successfully updated' });
    } catch (err) {
        return internalServerError(res, err);
    }
}

async function getUserData(userID) {
    const [rows] = await db.query(
        `select id, first_name, last_name, email, role
        from users
        where id = ? limit 1`,
        [userID]
    );

    if (!rows.length) return null;
    const user = rows[0];

    return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
    };
}

async function getUsersData() {
    const [rows] = await db.query(
        `select id, first_name, last_name, email, role
        from users
        order by id asc`
    );

    const users = rows.map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
    }));
    
    return users;
}

export async function renderAccount(req, res) {
    try {
        const userID = req.user?.id;
        if (!userID) return res.redirect('/login');

        const profile = await getUserData(userID);
        if (!profile) return notFound(res, 'User not found');
        
        const comments = await fetchCommentsByUser(userID);

        let users = [];
        const isAdmin = profile.role === 'admin';
        if (isAdmin) {
            users = await getUsersData();
        }

        const formattedComments = comments.map(comment => ({
            ...comment,
            preview: (comment.content && comment.content.length > 150) ? comment.content.slice(0, 150) + '...' : comment.content
        }));

        res.render('account', {
            title: 'Account - Milten',
            script: '<script src="/scripts/account.js"></script>',
            isAuthenticated: true,
            isAdmin,
            user: req.user || null,
            profile,
            comments: formattedComments,
            users
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function deleteUser(req, res) {
    try {
        const id = validateID(req.params.id);
        if (!id) return badRequest(res, 'Invalid ID');

        if (req.user.id === id) {
            return badRequest(res, "You cannot delete your own account");
        }

        await db.query('delete from comments where userID = ?', [id]);
        await db.query('delete from users where id = ?', [id]);

        return noContent();
    } catch (err) {
        return internalServerError(res, err);
    }
}
