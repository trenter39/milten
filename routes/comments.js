import express from 'express';
import verifyToken from '../config/auth.js';
import {
    getComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
} from '../controllers/comments.js';

const router = express.Router({ mergeParams: true });

router.get('/', getComments);
router.get('/:commentID', getComment);
router.post('/', verifyToken, createComment);
router.put('/:commentID', verifyToken, updateComment);
router.delete('/:commentID', verifyToken, deleteComment);

export default router;