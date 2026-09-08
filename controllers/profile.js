import db from '../config/db.js';
import { queryCommentsByUserWithPagination } from './comments.js';
import {
    ok,
    badRequest,
    notFound,
    internalServerError,
} from '../utils/httpResponses.js';

function parseProfileID(value) {
    if (!/^\d+$/.test(String(value))) return null;

    const userID = Number(value);
    return Number.isSafeInteger(userID) && userID > 0 ? userID : null;
}

async function getPublicProfile(userID) {
    const [rows] = await db.query(
        `select id, first_name, last_name, email, createdAt
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
        createdAt: user.createdAt,
    };
}

async function getProfilePageData(userID, req) {
    const profile = await getPublicProfile(userID);
    if (!profile) return null;

    const commentsResult = await queryCommentsByUserWithPagination({
        userID,
        page: req.query.comments_page,
        pageSize: req.query.pageSize,
    });

    const comments = commentsResult.comments.map((comment) => ({
        ...comment,
        preview:
            comment.content && comment.content.length > 150
                ? `${comment.content.slice(0, 150)}...`
                : comment.content,
    }));

    return { profile, comments, pagination: commentsResult };
}

export async function getProfile(req, res) {
    try {
        const userID = parseProfileID(req.params.userID);
        if (!userID) return badRequest(res, 'Invalid user ID');

        const profileData = await getProfilePageData(userID, req);
        if (!profileData) return notFound(res, 'User not found');

        return ok(res, {
            profile: profileData.profile,
            comments: profileData.comments,
            pagination: {
                page: profileData.pagination.page,
                pageSize: profileData.pagination.pageSize,
                totalCount: profileData.pagination.totalCount,
                totalPages: profileData.pagination.totalPages,
            },
        });
    } catch (err) {
        return internalServerError(res, err);
    }
}

export async function renderProfile(req, res) {
    try {
        const userID = parseProfileID(req.params.userID);
        if (!userID) return res.status(400).send('Invalid user ID');

        const profileData = await getProfilePageData(userID, req);
        if (!profileData) return res.status(404).send('User not found');

        const isAuthenticated = !!req.user;
        const isAdmin = req.user?.role === 'admin';

        return res.render('profile', {
            title: `${profileData.profile.firstName} ${profileData.profile.lastName} - Profile - Milten`,
            isAuthenticated,
            isAdmin,
            user: req.user || null,
            profile: profileData.profile,
            comments: profileData.comments,
            pagination: profileData.pagination,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error loading profile!');
    }
}
