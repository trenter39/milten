import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { queryCommentsByUserWithPagination } from './comments.js';
import { clearAuthCookie, createAuthToken, setAuthCookie } from './auth.js';
import {
    ok,
    noContent,
    badRequest,
    conflict,
    unauthorized,
    notFound,
    internalServerError,
} from '../utils/httpResponses.js';
import {
    validateRequiredFields,
    validateEmail,
    validatePassword,
} from '../utils/fieldValidator.js';

async function getUserData(userID) {
    const [rows] = await db.query(
        `select id, first_name, last_name, email, role, createdAt
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
        role: user.role,
        createdAt: user.createdAt,
    };
}

async function getUsersData() {
    const [rows] = await db.query(
        `select id, first_name, last_name, email, role
        from users
        order by id asc`
    );

    const users = rows.map((user) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
    }));

    return users;
}

export async function renderAccount(req, res) {
    try {
        const userID = req.user?.id;
        if (!userID) return res.redirect('/login');

        const profile = await getUserData(userID);
        if (!profile) return notFound(res, 'User not found');

        const commentsResult = await queryCommentsByUserWithPagination({
            userID,
            page: req.query.comments_page,
            pageSize: req.query.pageSize,
        });

        let users = [];
        const isAdmin = profile.role === 'admin';
        if (isAdmin) {
            users = await getUsersData();
        }

        const formattedComments = commentsResult.comments.map((comment) => ({
            ...comment,
            preview:
                comment.content && comment.content.length > 150
                    ? comment.content.slice(0, 150) + '...'
                    : comment.content,
        }));

        res.render('account', {
            title: 'Account - Milten',
            script: '<script type="module" src="/scripts/account.js"></script>',
            isAuthenticated: true,
            isAdmin,
            user: req.user || null,
            profile,
            comments: formattedComments,
            pagination: commentsResult,
            users,
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function updateProfile(req, res) {
    try {
        const missingFields = validateRequiredFields(req.body || {}, [
            'firstName',
            'lastName',
            'email',
        ]);
        if (missingFields) return badRequest(res, missingFields);

        const firstName = req.body.firstName.trim();
        const lastName = req.body.lastName.trim();
        const email = req.body.email.trim();
        const emailError = validateEmail(email);
        if (emailError) return badRequest(res, emailError);

        const [existing] = await db.query(
            'select id from users where email = ? and id <> ? limit 1',
            [email, req.user.id]
        );
        if (existing.length) return conflict(res, 'Email already exists');

        await db.query(
            `update users
            set first_name = ?, last_name = ?, email = ?, updatedAt = current_timestamp()
            where id = ?`,
            [firstName, lastName, email, req.user.id]
        );

        const profile = await getUserData(req.user.id);
        if (!profile) return notFound(res, 'User not found');

        setAuthCookie(res, createAuthToken(profile));
        return ok(res, { user: profile });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function updatePassword(req, res) {
    try {
        const missingFields = validateRequiredFields(req.body || {}, [
            'previousPassword',
            'password',
        ]);
        if (missingFields) return badRequest(res, missingFields);

        const previousPassword = req.body.previousPassword.trim();
        const password = req.body.password.trim();
        const passwordError = validatePassword(password);
        if (passwordError) return badRequest(res, passwordError);

        const [users] = await db.query(
            'select passwordHash from users where id = ? limit 1',
            [req.user.id]
        );
        if (!users.length) return notFound(res, 'User not found');

        const validPreviousPassword = await bcrypt.compare(previousPassword, users[0].passwordHash);
        if (!validPreviousPassword) return unauthorized(res, 'Previous password is incorrect');

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            `update users
            set passwordHash = ?, updatedAt = current_timestamp()
            where id = ?`,
            [passwordHash, req.user.id]
        );
        if (!result.affectedRows) return notFound(res, 'User not found');

        return noContent(res);
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function deleteAccount(req, res) {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        await connection.query('update comments set userID = null where userID = ?', [req.user.id]);
        const [result] = await connection.query('delete from users where id = ?', [req.user.id]);
        if (!result.affectedRows) {
            await connection.rollback();
            return notFound(res, 'User not found');
        }
        await connection.commit();
        clearAuthCookie(res);
        return noContent(res);
    } catch (err) {
        if (connection) await connection.rollback();
        return internalServerError(res, err);
    } finally {
        if (connection) connection.release();
    }
}
