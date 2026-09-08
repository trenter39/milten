import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.js';
import { updateProfile, updatePassword, deleteAccount } from '../controllers/account.js';
import verifyToken from '../config/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getCurrentUser);
router.patch('/me/profile', verifyToken, updateProfile);
router.patch('/me/password', verifyToken, updatePassword);
router.delete('/me', verifyToken, deleteAccount);

export default router;
