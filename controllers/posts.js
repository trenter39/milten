import db from '../config/db.js';
import {
    validateID,
    ok,
    created,
    noContent,
    badRequest,
    notFound,
    internalServerError,
    validateRequiredFields
} from '../utils/APIHelper.js';

export async function fetchPost(id) {
    const [result] = await db.query('select * from posts where id = ?', [id]);
    if (!result.length) return null;
    return result[0];
}

export async function fetchPosts({ mode = "api" } = {}) {
    let sql;
    (mode === "frontend" ?
        sql = "select * from posts order by createdAt desc" :
        sql = "select * from posts order by id asc");

    const [result] = await db.query(sql);
    return result;
}

export async function getPost(req, res) {
    try {
        const id = validateID(req.params.postID);
        if (!id) return badRequest(res, 'Invalid ID');

        const post = await fetchPost(id);
        if (!post) return notFound(res, "Post wasn't found!");

        return ok(res, post);
    } catch (err) {
        internalServerError(res, err);
    }
}

export async function getPosts(req, res) {
    try {
        const posts = await fetchPosts();
        return ok(res, posts);
    } catch (err) {
        internalServerError(res, err);
    }
}

export async function getPostsTerm(req, res) {
    try {
        const searchTerm = req.query.term || req.query.q || null;
        const page = req.query.page || 1;

        const result = await queryPostsWithSearchAndPagination({
            term: searchTerm,
            page
        });

        return ok(res, {
            posts: result.posts,
            pagination: {
                page: result.page,
                pageSize: result.pageSize,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function createPost(req, res) {
    try {
        const missingFields = validateRequiredFields(
            req.body || {},
            ['title', 'content', 'category']
        );

        if (missingFields) return badRequest(res, missingFields);

        const { title, content, category } = req.body;

        const [result] = await db.query(
            `insert into posts(title, content, category)
            values (?, ?, ?)`,
            [title, content, category]
        );

        const [rows] = await db.query(
            `select * from posts
            where id = ?`,
            [result.insertId]
        );

        const createdPost = rows[0];
        createdPost.createdAt = createdPost.createdAt.toISOString();
        createdPost.updatedAt = createdPost.updatedAt.toISOString();

        return created(res, createdPost);
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function updatePost(req, res) {
    try {
        const id = validateID(req.params.postID);
        if (!id) return badRequest(res, 'Invalid ID');

        const missingFields = validateRequiredFields(
            req.body || {},
            ['title', 'content', 'category']
        );

        if (missingFields) return badRequest(res, missingFields);
        
        let { title, content, category } = req.body;

        const [rows] = await db.query('select * from posts where id = ?', [id]);
        if (!rows.length) return notFound(res, "Post not found!");

        await db.query(
            `update posts
            set
            title = coalesce(?, title),
            content = coalesce(?, content),
            category = coalesce(?, category)
            where id = ?`,
            [title, content, category, id]
        );

        const [updated] = await db.query('select * from posts where id = ?', [id]);

        const updatedPost = updated[0];
        updatedPost.createdAt = updatedPost.createdAt.toISOString();
        updatedPost.updatedAt = updatedPost.updatedAt.toISOString();

        return ok(res, updatedPost);
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function deletePost(req, res) {
    try {
        const id = validateID(req.params.postID);
        if (!id) return badRequest(res, 'Invalid ID');

        const [rows] = await db.query('select 1 from posts where id = ?', [id]);
        if (!rows.length) return notFound(res, "Post wasn't found!");

        await db.query("delete from posts where id = ?", [id]);

        return noContent(res);
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function queryPostsWithSearchAndPagination({ term = null, page = 1, pageSize = 10 } = {}) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.max(1, parseInt(pageSize) || 10);
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    let queryParams = [];

    if (term && term.trim().length > 0) {
        const searchTerm = term.trim().substring(0, 255);
        const likeTerm = `%${searchTerm}%`;
        whereClause = 'where title like ? or content like ? or category like ?';
        queryParams = [likeTerm, likeTerm, likeTerm];
    }

    const postsQuery = `
        select * from posts
        ${whereClause}
        order by createdAt desc
        limit ? offset ?
    `;
    const [posts] = await db.query(postsQuery, [...queryParams, pageSize, offset]);

    const countQuery = `
        select count(*) as total from posts
        ${whereClause}
    `;
    const [countResult] = await db.query(countQuery, queryParams);
    const totalCount = countResult[0].total;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
        posts,
        totalCount,
        page,
        pageSize,
        totalPages
    };
}