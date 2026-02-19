import db from '../config/db.js';
import { fetchCommentsByUser } from './comments.js';
import {
    notFound,
    internalServerError
} from '../utils/APIHelper.js';

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
        createdAt: user.createdAt
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