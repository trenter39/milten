import express from 'express';
import verifyToken, { verifyAdmin } from '../config/auth.js';
import {
    getPosts,
    getPost,
    getPostsTerm,
    createPost,
    updatePost,
    deletePost,
} from '../controllers/posts.js';
import commentRouter from './comments.js';
import { getLikeStatus, likePost, unlikePost } from '../controllers/likes.js';
import {
    getBookmarkStatus,
    bookmarkPost,
    unbookmarkPost,
} from '../controllers/bookmarks.js';

const router = express.Router();

router.get('/', (req, res) =>
    req.query.term || req.query.q ? getPostsTerm(req, res) : getPosts(req, res)
);
router.get('/:postID', getPost);
router.post('/', verifyToken, verifyAdmin, createPost);
router.put('/:postID', verifyToken, verifyAdmin, updatePost);
router.delete('/:postID', verifyToken, verifyAdmin, deletePost);

router.get('/:postID/likes', verifyToken, getLikeStatus);
router.post('/:postID/likes', verifyToken, likePost);
router.delete('/:postID/likes', verifyToken, unlikePost);
router.get('/:postID/bookmarks', verifyToken, getBookmarkStatus);
router.post('/:postID/bookmarks', verifyToken, bookmarkPost);
router.delete('/:postID/bookmarks', verifyToken, unbookmarkPost);

router.use('/:postID/comments', commentRouter);

export default router;
