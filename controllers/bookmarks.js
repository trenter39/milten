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

export async function queryBookmarksByUserWithPagination({
    userID,
    page = 1,
    pageSize = 10,
} = {}) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.max(1, parseInt(pageSize) || 10);
    const offset = (page - 1) * pageSize;

    const [bookmarks] = await db.query(
        `
        select b.postID, p.title as postTitle, b.createdAt as issuedAt
        from bookmarks b
        inner join posts p on p.id = b.postID
        where b.userID = ?
        order by b.createdAt asc, b.id asc
        limit ? offset ?
        `,
        [userID, pageSize, offset]
    );

    const [countResult] = await db.query(
        'select count(*) as total from bookmarks where userID = ?',
        [userID]
    );
    const totalCount = countResult[0].total;

    return {
        bookmarks,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
}

export async function getBookmarksByUser(req, res) {
    try {
        const userID = validateID(req.params.userID);
        if (!userID) return badRequest(res, 'Invalid user ID');

        const [users] = await db.query('select 1 from users where id = ?', [userID]);
        if (!users.length) return notFound(res, 'User not found');

        const result = await queryBookmarksByUserWithPagination({
            userID,
            page: req.query.bookmarks_page,
            pageSize: req.query.pageSize,
        });

        return ok(res, {
            bookmarks: result.bookmarks,
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

export async function bookmarkPost(req, res) {
    try {
        const postID = await getValidatedPostID(req, res);
        if (!postID) return;

        await db.query(
            `insert ignore into bookmarks (postID, userID)
            values (?, ?)`,
            [postID, req.user.id]
        );

        return ok(res, { message: 'Post has been bookmarked successfully' });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function getBookmarkStatus(req, res) {
    try {
        const postID = await getValidatedPostID(req, res);
        if (!postID) return;

        const [rows] = await db.query(
            'select 1 from bookmarks where postID = ? and userID = ?',
            [postID, req.user.id]
        );

        return ok(res, { bookmarked: rows.length > 0 });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function unbookmarkPost(req, res) {
    try {
        const postID = await getValidatedPostID(req, res);
        if (!postID) return;

        await db.query('delete from bookmarks where postID = ? and userID = ?', [
            postID,
            req.user.id,
        ]);

        return ok(res, { message: 'You removed your bookmark from the post' });
    } catch (err) {
        return internalServerError(res, err);
    }
}