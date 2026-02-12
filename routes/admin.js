import express from 'express';
import { createUser, updateUser, deleteUser } from '../controllers/account.js';

const router = express.Router();

router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;