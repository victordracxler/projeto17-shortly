import { Router } from 'express';
import { shortenUrl } from '../controllers/urls.controllers.js';

const router = Router();

router.post('/urls/shorten', shortenUrl);

// router.get('/urls/:id', getUrlById);

export default router;