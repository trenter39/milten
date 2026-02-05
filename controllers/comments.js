import db from '../config/db.js';
import { handleError, validateID, badRequest } from '../utils/APIHelper.js';

export async function fetchComments(postID) {
    const sql = `select * from comments where postID = ?`;

    const [result] = await db.query(sql, [postID]);
    if (!result.length) return null;

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

        const { author, content } = req.body;
        if (!author || !content) {
            return res.status(400).json({ error: "Missing fields!" });
        }

        const [checkRows] = await db.query(
            `select 1 from posts
            where id = ?`,
            [postID]
        );
        if (!checkRows.length) {
            return res.status(404).json({ error: "Post wasn't found!" });
        }

        const [result] = await db.query(
            `insert into comments(postID, author, content)
            values(?, ?, ?)`,
            [postID, author, content]
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

        const { author, content } = req.body;

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

        await db.query(
            `update comments
            set
            author = coalesce(?, author),
            content = coalesce(?, content)
            where id = ?`,
            [author, content, commentID]);
        
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
            `select postID from comments
            where id = ?`,
            [commentID]
        );

        if (!checkResult.length) {
            return res.status(404).json({ error: "Comment wasn't found!" });
        }

        if (checkResult[0].postID !== postID) {
            return res.status(400).json({ error: "Comment doesn't belong to the specified post!" });
        }

        await db.query("delete from comments where id = ?", [commentID]);

        return res.status(204).send();
    } catch (err) {
        return handleError(res, err);
    }
}