import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.js';
import verifyToken from '../config/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getCurrentUser);

export default router;
