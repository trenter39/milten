import db from '../config/db.js';
import { handleError, validateID, badRequest } from '../utils/APIHelper.js';

export async function fetchComments(postID) {
    const sql = `select * from comments where postID = ?`;
    const [result] = await db.query(sql, [postID]);
    if (result.length === 0) return null;
    return result;
}

export async function getComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res);
        const sql = "select * from comments where postID = ? and id = ?";
        const [result] = await db.query(sql, [postID, commentID]);
        if (result.length === 0) return res.status(404).json({ error: "Comment wasn't found!" });
        return res.status(200).json(result[0]);
    } catch (err) { return handleError(res, err); }
}

export async function getComments(req, res) {
    try {
        const postID = validateID(req.params.postID);
        if (!postID) return badRequest(res);
        const comments = await fetchComments(postID);
        if (!comments) return res.status(404).send("Comments weren't found!");
        return res.status(200).json(comments);
    } catch (err) { return handleError(res, err); }
}

export async function createComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        if (!postID) return badRequest(res);
        const { author, content } = req.body;
        if (!author || !content) return res.status(400).json({ error: "Missing fields!" });
        const [checkResult] = await db.query("select 1 from posts where id = ?", [postID]);
        if (checkResult.length === 0) return res.status(404).json({ error: "Post wasn't found!" });
        const createsql = "insert into comments(postID, author, content) values(?, ?, ?)";
        const [result] = await db.query(createsql, [postID, author, content]);
        const [rows] = await db.query("select * from comments where id = ?", [result.insertId]);
        const createdComment = rows[0];
        createdComment.createdAt = createdComment.createdAt.toISOString();
        createdComment.updatedAt = createdComment.updatedAt.toISOString();
        return res.status(201).json(createdComment);
    } catch (err) { return handleError(res, err); }
}

export async function changeComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res);
        const { author, content } = req.body;
        if (!author || !content) return res.status(400).json({ error: "PUT request missing required fields!" });
        const [selectResult] = await db.query("select * from comments where id = ?", [commentID]);
        if (selectResult.length === 0) return res.status(404).json({ error: "Comment wasn't found!" });
        const currentComment = selectResult[0];
        if (currentComment.postID !== postID) return res.status(400).json({ error: "Comment doesn't belong to the specified post!" });
        const updatesql = "update comments set author = ?, content = ? where id = ?";
        await db.query(updatesql, [author, content, commentID]);
        const [updatedResult] = await db.query("select * from comments where id = ?", [commentID]);
        const updatedComment = updatedResult[0];
        updatedComment.createdAt = updatedComment.createdAt.toISOString();
        updatedComment.updatedAt = updatedComment.updatedAt.toISOString();
        return res.status(200).json(updatedComment);
    } catch (err) { return handleError(res, err); }
}

export async function updateComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res);
        const { author, content } = req.body;
        if (author == null && content == null) return res.status(400).json({ error: "PATCH request must contain at least one field!" });
        const [selectResult] = await db.query("select * from comments where id = ?", [commentID]);
        if (selectResult.length === 0) return res.status(404).json({ error: "Comment wasn't found!" });
        const currentComment = selectResult[0];
        if (currentComment.postID !== postID) return res.status(400).json({ error: "Comment doesn't belong to the specified post!" });
        const updatedAuthor = author ?? currentComment.author;
        const updatedContent = content ?? currentComment.content;
        const updatesql = "update comments set author = ?, content = ? where id = ?";
        const values = [updatedAuthor, updatedContent, commentID];
        await db.query(updatesql, values);
        const [updatedResult] = await db.query("select * from comments where id = ?", [commentID]);
        const updatedComment = updatedResult[0];
        updatedComment.createdAt = updatedComment.createdAt.toISOString();
        updatedComment.updatedAt = updatedComment.updatedAt.toISOString();
        return res.status(200).json(updatedComment);
    } catch (err) { return handleError(res, err); }
}

export async function deleteComment(req, res) {
    try {
        const postID = validateID(req.params.postID);
        const commentID = validateID(req.params.commentID);
        if (!postID || !commentID) return badRequest(res);
        const checksql = "select postID from comments where id = ?";
        const [checkResult] = await db.query(checksql, [commentID]);
        if (checkResult.length === 0) return res.status(404).json({ error: "Comment wasn't found!" });
        if (checkResult[0].postID !== postID) return res.status(400).json({ error: "Comment doesn't belong to the specified post!" });
        await db.query("delete from comments where id = ?", [commentID]);
        return res.status(204).send();
    } catch (err) { return handleError(res, err); }
}