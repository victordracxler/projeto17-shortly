import { Router } from 'express';
import { getMe, rankUsers } from '../controllers/stats.controller.js';

const router = Router();

router.get('/users/me', getMe);

router.get('/ranking', rankUsers);

export default router;
