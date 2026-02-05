import express from 'express';
import {
    getComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
} from '../controllers/comments.js';

const router = express.Router({mergeParams: true});

router.get('/', getComments);
router.get('/:commentID', getComment);
router.post('/', createComment);
router.put('/:commentID', updateComment);
router.delete('/:commentID', deleteComment);

export default router;