import db from '../config/db.js';
import { handleError, validateID, badRequest } from '../utils/APIHelper.js';

export async function fetchComments(postID) {
    const sql = `select * from comments where postID = ?`;

    const [result] = await db.query(sql, [postID]);
    if (!result.length) return null;

    return result;
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

export async function getComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res);

        const [rows] = await db.query(
            `select * from comments
            where postID = ? and id = ?`,
            [postID, commentID]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Comment wasn't found!" });
        }

        return res.status(200).json(rows[0]);
    } catch (err) {
        return handleError(res, err);
    }
}

export async function getComments(req, res) {
    try {
        const postID = validateID(req.params.postID);
        if (!postID) return badRequest(res);

        const comments = await fetchComments(postID);
        if (!comments) {
            return res.status(404).send("Comments weren't found!");
        }

        return res.status(200).json(comments);
    } catch (err) {
        return handleError(res, err);
    }
}

export async function createComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        if (!postID) return badRequest(res);

        const { content } = req.body;
        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: "Comment content is required." });
        }

        const author = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email;
        const userID = req.user.id;

        const [checkRows] = await db.query(
            `select 1 from posts
            where id = ?`,
            [postID]
        );
        if (!checkRows.length) {
            return res.status(404).json({ error: "Post wasn't found!" });
        }

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

        return res.status(201).json(createdComment);
    } catch (err) {
        return handleError(res, err);
    }
}

export async function updateComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res);

        const { content } = req.body;
        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: "Comment content is required." });
        }

        const [selectRows] = await db.query(
            `select * from comments
            where id = ?`,
            [commentID]
        );

        if (!selectRows.length) {
            return res.status(404).json({ error: "Comment wasn't found!" });
        }

        const currentComment = selectRows[0];
        if (currentComment.postID !== postID) {
            return res.status(400).json({ error: "Comment doesn't belong to the specified post!" });
        }

        const commentUserID = currentComment.userID != null ? currentComment.userID : undefined;
        if (commentUserID !== req.user.id) {
            return res.status(403).json({ error: "You can only edit your own comments." });
        }

        await db.query(
            `update comments set content = ? where id = ?`,
            [content.trim(), commentID]
        );

        const [updated] = await db.query(
            `select * from comments
            where id = ?`,
            [commentID]
        );

        const updatedComment = updated[0];
        updatedComment.createdAt = updatedComment.createdAt.toISOString();
        updatedComment.updatedAt = updatedComment.updatedAt.toISOString();

        return res.status(200).json(updatedComment);
    } catch (err) {
        return handleError(res, err);
    }
}

export async function deleteComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res);

        const [checkResult] = await db.query(
            `select postID, userID from comments
            where id = ?`,
            [commentID]
        );

        if (!checkResult.length) {
            return res.status(404).json({ error: "Comment wasn't found!" });
        }

        const comment = checkResult[0];
        if (comment.postID !== postID) {
            return res.status(400).json({ error: "Comment doesn't belong to the specified post!" });
        }

        const isOwner = comment.userID != null && comment.userID === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "You can only delete your own comments. Administrators may delete any comment." });
        }

        await db.query("delete from comments where id = ?", [commentID]);

        return res.status(204).send();
    } catch (err) {
        return handleError(res, err);
    }
}