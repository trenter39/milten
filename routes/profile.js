import express from 'express';
import verifyToken, { verifyUserResource } from '../config/auth.js';
import { getProfile } from '../controllers/profile.js';
import { getLikesByUser } from '../controllers/likes.js';
import { getBookmarksByUser } from '../controllers/bookmarks.js';

const router = express.Router();

router.get('/:userID', getProfile);
router.get('/:userID/likes', verifyToken, verifyUserResource, getLikesByUser);
router.get('/:userID/bookmarks', verifyToken, verifyUserResource, getBookmarksByUser);

export default router;
