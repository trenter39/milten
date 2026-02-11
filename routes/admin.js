import express from 'express';
import { deleteUser } from '../controllers/account.js';

const router = express.Router();

router.delete('/users/:id', deleteUser);

export default router;