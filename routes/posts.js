import express from 'express';
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

router.get('/', (req, res) => req.query.term ? getPostsTerm(req, res) : getPosts(req, res));
router.get('/:postID', getPost);
router.post('/', createPost);
router.put('/:postID', updatePost);
router.delete('/:postID', deletePost);

router.use('/:postID/comments', commentRouter);

export default router;