import db from '../config/db.js';
import { handleError, validateID, formatTags, badRequest } from '../utils/APIHelper.js';

export async function fetchPost(id) {
    const [result] = await db.query("select * from posts where id = ?", [id]);
    if (result.length === 0) return null;
    return formatTags(result)[0];
}

export async function getPost(req, res) {
    try {
        const id = validateID(req.params.postID);
        if (!id) return badRequest(res);
        const post = await fetchPost(id);
        if (!post) return res.status(404).send("Post wasn't found!");
        return res.status(200).json(post);
    } catch (err) { handleError(res, err); }
}

export async function fetchPosts({ mode = "api" } = {}) {
    let sql;
    (mode === "frontend" ?
        sql = "select * from posts order by createdAt desc" :
        sql = "select * from posts order by id asc");
    const [result] = await db.query(sql);
    return formatTags(result);
}

export async function getPosts(req, res) {
    try {
        const posts = await fetchPosts();
        return res.status(200).json(posts);
    } catch (err) { handleError(res, err); }
}

export async function getPostsTerm(req, res) {
    try {
        const searchTerm = req.query.term;
        const likeTerm = `%${searchTerm}%`;
        const sql = "select * from posts where title like ? or content like ? or category like ? or tags like ?";
        const values = [likeTerm, likeTerm, likeTerm, likeTerm];
        const [result] = await db.query(sql, values);
        return res.status(200).json(formatTags(result));
    } catch (err) { handleError(res, err); }
}

export async function createPost(req, res) {
    try {
        const { title, content, category, tags } = req.body;
        if (!title || !content || !category || !Array.isArray(tags)) return res.status(400).json({ error: "Missing fields or invalid format!" });
        const tagString = tags.join(',');
        const createsql = "insert into posts(title, content, category, tags) values (?, ?, ?, ?)";
        const values = [title, content, category, tagString];
        const [result] = await db.query(createsql, values);
        const [rows] = await db.query("select * from posts where id = ?", [result.insertId]);
        const createdPost = rows[0];
        createdPost.createdAt = createdPost.createdAt.toISOString();
        createdPost.updatedAt = createdPost.updatedAt.toISOString();
        return res.status(201).json(createdPost);
    } catch (err) { handleError(res, err); }
}

export async function changePost(req, res) {
    try {
        const id = validateID(req.params.postID);
        if (!id) return badRequest(res);
        const { title, content, category, tags } = req.body;
        if (!title || !content || !category || !Array.isArray(tags)) return res.status(400).json({ error: "PUT request missing required fields!" });
        const [selectResult] = await db.query("select * from posts where id = ?", [id]);
        if (selectResult.length === 0) return res.status(404).json({ error: "Post wasn't found!" });
        const tagString = tags.join(',');
        const updatesql = "update posts set title = ?, content = ?, category = ?, tags = ? where id = ?";
        const values = [title, content, category, tagString, id];
        await db.query(updatesql, values);
        const [updatedResult] = await db.query("select * from posts where id = ?", [id]);
        const updatedPost = updatedResult[0];
        updatedPost.createdAt = updatedPost.createdAt.toISOString();
        updatedPost.updatedAt = updatedPost.updatedAt.toISOString();
        if (updatedPost.tags) updatedPost.tags = updatedPost.tags.split(',');
        return res.status(200).json(updatedPost);
    } catch (err) { handleError(res, err); }
}

export async function updatePost(req, res) {
    try {
        const id = validateID(req.params.postID);
        if (!id) return badRequest(res);
        let { title, content, category, tags } = req.body;
        const [selectResult] = await db.query("select * from posts where id = ?", [id]);
        if (selectResult.length === 0) return res.status(404).json({ error: "Post wasn't found!" });
        const initPost = selectResult[0];
        const updatedTitle = title ?? initPost.title;
        const updatedContent = content ?? initPost.content;
        const updatedCategory = category ?? initPost.category;
        const updatedTags = tags?.join(',') ?? initPost.tags;
        const updatesql = "update posts set title = ?, content = ?, category = ?, tags = ? where id = ?";
        const values = [updatedTitle, updatedContent, updatedCategory, updatedTags, id];
        await db.query(updatesql, values);
        const [updatedResult] = await db.query("select * from posts where id = ?", [id]);
        const updatedPost = updatedResult[0];
        updatedPost.createdAt = updatedPost.createdAt.toISOString();
        updatedPost.updatedAt = updatedPost.updatedAt.toISOString();
        if (updatedPost.tags) updatedPost.tags = updatedPost.tags.split(',');
        return res.status(200).json(updatedPost);
    } catch (err) { handleError(res, err); }
}

export async function deletePost(req, res) {
    try {
        const id = validateID(req.params.postID);
        if (!id) return badRequest(res);
        const [result] = await db.query("select 1 from posts where id = ?", [id]);
        if (result.length === 0) return res.status(404).json({ error: "Post wasn't found!" });
        await db.query("delete from posts where id = ?", [id]);
        return res.status(204).send();
    } catch (err) { handleError(res, err); }
}