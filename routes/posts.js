import express from 'express';
import verifyToken, { verifyAdmin } from '../config/auth.js';
import {
    getPosts,
    getPost,
    getPostsTerm,
    createPost,
    updatePost,
    deletePost
} from '../controllers/posts.js';
import commentRouter from './comments.js';

const router = express.Router();

router.get('/', (req, res) => req.query.term || req.query.q ? getPostsTerm(req, res) : getPosts(req, res));
router.get('/:postID', getPost);
router.post('/', verifyToken, verifyAdmin, createPost);
router.put('/:postID', verifyToken, verifyAdmin, updatePost);
router.delete('/:postID', verifyToken, verifyAdmin, deletePost);

router.use('/:postID/comments', commentRouter);

export default router;