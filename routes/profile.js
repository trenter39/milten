import express from 'express';
import { getProfile } from '../controllers/profile.js';
import { getLikesByUser } from '../controllers/likes.js';
import { getBookmarksByUser } from '../controllers/bookmarks.js';

const router = express.Router();

router.get('/:userID', getProfile);
router.get('/:userID/likes', getLikesByUser);
router.get('/:userID/bookmarks', getBookmarksByUser);

export default router;
