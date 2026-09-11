import db from '../config/db.js';
import {
    validateID,
    ok,
    badRequest,
    notFound,
    internalServerError,
} from '../utils/httpResponses.js';

async function getValidatedPostID(req, res) {
    const postID = validateID(req.params.postID);
    if (!postID) {
        badRequest(res, 'Invalid ID');
        return null;
    }

    const [rows] = await db.query('select 1 from posts where id = ?', [postID]);
    if (!rows.length) {
        notFound(res, "Post wasn't found!");
        return null;
    }

    return postID;
}

export async function queryLikesByUserWithPagination({
    userID,
    page = 1,
    pageSize = 10,
} = {}) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.max(1, parseInt(pageSize) || 10);
    const offset = (page - 1) * pageSize;

    const [likes] = await db.query(
        `
        select l.postID, p.title as postTitle, l.createdAt as issuedAt
        from likes l
        inner join posts p on p.id = l.postID
        where l.userID = ?
        order by l.createdAt asc, l.id asc
        limit ? offset ?
        `,
        [userID, pageSize, offset]
    );

    const [countResult] = await db.query(
        'select count(*) as total from likes where userID = ?',
        [userID]
    );
    const totalCount = countResult[0].total;

    return {
        likes,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
}

export async function getLikesByUser(req, res) {
    try {
        const userID = validateID(req.params.userID);
        if (!userID) return badRequest(res, 'Invalid user ID');

        const [users] = await db.query('select 1 from users where id = ?', [userID]);
        if (!users.length) return notFound(res, 'User not found');

        const result = await queryLikesByUserWithPagination({
            userID,
            page: req.query.likes_page,
            pageSize: req.query.pageSize,
        });

        return ok(res, {
            likes: result.likes,
            pagination: {
                page: result.page,
                pageSize: result.pageSize,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
            },
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function likePost(req, res) {
    try {
        const postID = await getValidatedPostID(req, res);
        if (!postID) return;

        await db.query(
            `insert ignore into likes (postID, userID)
            values (?, ?)`,
            [postID, req.user.id]
        );

        return ok(res, { message: 'Post has been liked successfully' });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function getLikeStatus(req, res) {
    try {
        const postID = await getValidatedPostID(req, res);
        if (!postID) return;

        const [rows] = await db.query(
            'select 1 from likes where postID = ? and userID = ?',
            [postID, req.user.id]
        );

        return ok(res, { liked: rows.length > 0 });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function unlikePost(req, res) {
    try {
        const postID = await getValidatedPostID(req, res);
        if (!postID) return;

        await db.query('delete from likes where postID = ? and userID = ?', [
            postID,
            req.user.id,
        ]);

        return ok(res, { message: 'You removed your like from the post' });
    } catch (err) {
        return internalServerError(res, err);
    }
}