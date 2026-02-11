import db from '../config/db.js';
import { handleError, validateID, badRequest } from '../utils/APIHelper.js';
import { fetchCommentsByUser } from './comments.js';

export async function renderAccount(req, res) {
    try {
        const userID = req.user?.id;
        if (!userID) return res.redirect('/login');

        const [rows] = await db.query(
            `select id, first_name, last_name, email, role
            from users
            where id = ? limit 1`,
            [userID]
        );

        if (!rows.length) return res.status(404).send('User not found');

        const userRow = rows[0];
        const profile = {
            id: userRow.id,
            firstName: userRow.first_name,
            lastName: userRow.last_name,
            email: userRow.email,
            role: userRow.role || 'user'
        };

        const comments = await fetchCommentsByUser(userID);

        let users = [];
        const isAdmin = profile.role === 'admin';
        if (isAdmin) {
            const [all] = await db.query(
                `select id, first_name, last_name, email, role
                from users
                order by id asc`
            );
            users = all.map(u => ({
                id: u.id,
                firstName: u.first_name,
                lastName: u.last_name,
                email: u.email,
                role: u.role || 'user'
            }));
        }

        const formattedComments = comments.map(c => ({
            id: c.id,
            content: c.content,
            preview: (c.content && c.content.length > 150) ? c.content.slice(0, 150) + '...' : c.content,
            postTitle: c.postTitle || 'Unknown',
            postID: c.postID,
            createdAt: c.createdAt ? (c.createdAt.toISOString ? c.createdAt.toISOString() : String(c.createdAt)) : null
        }));

        res.render('account', {
            title: 'Account - Murny',
            script: '<script src="/scripts/account.js"></script>',
            isAuthenticated: true,
            isAdmin,
            user: req.user || null,
            profile,
            comments: formattedComments,
            users
        });
    } catch (err) {
        return handleError(res, err);
    }
}

export async function deleteUser(req, res) {
    try {
        const id = validateID(req.params.id);
        if (!id) return badRequest(res);

        if (req.user.id === id) {
            return res.status(400).json({ error: "You cannot delete your own account." });
        }

        await db.query('delete from comments where userID = ?', [id]);
        await db.query('delete from users where id = ?', [id]);

        return res.status(204).send();
    } catch (err) {
        return handleError(res, err);
    }
}
