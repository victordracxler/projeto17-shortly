import { Router } from 'express';
import {
	getUrlById,
	redirectUrl,
	shortenUrl,
} from '../controllers/urls.controllers.js';

const router = Router();

router.post('/urls/shorten', shortenUrl);

router.get('/urls/:id', getUrlById);

router.get('/urls/open/:shortUrl', redirectUrl);

export default router;
