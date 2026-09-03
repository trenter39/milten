import db from '../config/db.js';
import {
    validateID,
    ok,
    created,
    noContent,
    badRequest,
    forbidden,
    notFound,
    internalServerError,
} from '../utils/httpResponses.js';

export async function fetchComments(postID) {
    const sql = `select * from comments
        where postID = ?
        order by createdAt desc`;

    const [result] = await db.query(sql, [postID]);
    if (!result.length) return null;

    return result;
}

export async function queryCommentsWithPagination({
    postID,
    page = 1,
    pageSize = 10,
} = {}) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.max(1, parseInt(pageSize) || 10);
    const offset = (page - 1) * pageSize;

    const commentsQuery = `
        select * from comments
        where postID = ?
        order by createdAt desc
        limit ? offset ?
    `;
    const [comments] = await db.query(commentsQuery, [postID, pageSize, offset]);

    const [countResult] = await db.query(
        'select count(*) as total from comments where postID = ?',
        [postID]
    );
    const totalCount = countResult[0].total;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
        comments,
        totalCount,
        page,
        pageSize,
        totalPages,
    };
}

export async function fetchCommentsByUser(userID) {
    const sql = `
        select c.*, p.title as postTitle, p.id as postID
        from comments c
        left join posts p on p.id = c.postID
        where c.userID = ?
        order by c.createdAt desc
    `;

    const [result] = await db.query(sql, [userID]);
    if (!result.length) return [];

    return result;
}

export async function queryCommentsByUserWithPagination({
    userID,
    page = 1,
    pageSize = 5,
} = {}) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.max(1, parseInt(pageSize) || 10);
    const offset = (page - 1) * pageSize;

    const [comments] = await db.query(
        `
        select c.*, p.title as postTitle, p.id as postID
        from comments c
        left join posts p on p.id = c.postID
        where c.userID = ?
        order by c.createdAt desc
        limit ? offset ?
        `,
        [userID, pageSize, offset]
    );

    const [countResult] = await db.query(
        'select count(*) as total from comments where userID = ?',
        [userID]
    );
    const totalCount = countResult[0].total;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
        comments,
        totalCount,
        page,
        pageSize,
        totalPages,
    };
}

export async function getComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res, 'Invalid ID');

        const [rows] = await db.query(
            `select * from comments
            where postID = ? and id = ?`,
            [postID, commentID]
        );

        if (!rows.length) return notFound(res, "Comment wasn't found!");

        return ok(res, rows[0]);
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function getComments(req, res) {
    try {
        const postID = validateID(req.params.postID);
        if (!postID) return badRequest(res, 'Invalid ID');

        const result = await queryCommentsWithPagination({
            postID,
            page: req.query.comments_page,
            pageSize: req.query.pageSize,
        });

        if (!result.totalCount) return notFound(res, "Comments weren't found!");

        return ok(res, {
            comments: result.comments,
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

export async function createComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        if (!postID) return badRequest(res, 'Invalid ID');

        const { content } = req.body || {};
        if (!content || typeof content !== 'string' || !content.trim()) {
            return badRequest(res, 'Comment content is required.');
        }

        const author = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
        const userID = req.user.id;

        const [checkRows] = await db.query(
            `select 1 from posts
            where id = ?`,
            [postID]
        );

        if (!checkRows.length) return notFound(res, "Post wasn't found!");

        const [result] = await db.query(
            `insert into comments(postID, author, content, userID)
            values(?, ?, ?, ?)`,
            [postID, author, content.trim(), userID]
        );

        const [rows] = await db.query(
            `select * from comments
            where id = ?`,
            [result.insertId]
        );

        const createdComment = rows[0];
        createdComment.createdAt = createdComment.createdAt.toISOString();
        createdComment.updatedAt = createdComment.updatedAt.toISOString();

        return created(res, createdComment);
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function updateComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res, 'Invalid ID');

        const { content } = req.body || {};
        if (!content || typeof content !== 'string' || !content.trim()) {
            return badRequest(res, 'Comment content is required.');
        }

        const [selectRows] = await db.query(
            `select * from comments
            where id = ?`,
            [commentID]
        );

        if (!selectRows.length) return notFound(res, "Comment wasn't found!");

        const currentComment = selectRows[0];
        if (currentComment.postID !== postID)
            return badRequest(res, "Comment doesn't belong to the specified post!");

        const commentUserID = currentComment.userID != null ? currentComment.userID : undefined;
        if (commentUserID !== req.user.id)
            return forbidden(res, 'You can only edit your own comments.');

        await db.query(`update comments set content = ? where id = ?`, [content.trim(), commentID]);

        const [updated] = await db.query(
            `select * from comments
            where id = ?`,
            [commentID]
        );

        const updatedComment = updated[0];
        updatedComment.createdAt = updatedComment.createdAt.toISOString();
        updatedComment.updatedAt = updatedComment.updatedAt.toISOString();

        return ok(res, updatedComment);
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function deleteComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res, 'Invalid ID');

        const [checkResult] = await db.query(
            `select postID, userID from comments
            where id = ?`,
            [commentID]
        );

        if (!checkResult.length) return notFound(res, "Comment wasn't found!");

        const comment = checkResult[0];
        if (comment.postID !== postID)
            return badRequest(res, "Comment doesn't belong to the specified post!");

        const isOwner = comment.userID != null && comment.userID === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return forbidden(
                res,
                'You can only delete your own comments. Administrators may delete any comment.'
            );
        }

        await db.query('delete from comments where id = ?', [commentID]);

        return noContent(res);
    } catch (err) {
        return internalServerError(res, err);
    }
}
