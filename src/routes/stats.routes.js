import { Router } from 'express';
import { getMe } from '../controllers/stats.controller.js';

const router = Router();

router.get('/users/me', getMe);

export default router;
