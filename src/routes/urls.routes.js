import { Router } from 'express';
import {
	deleteUrl,
	getUrlById,
	redirectUrl,
	shortenUrl,
} from '../controllers/urls.controllers.js';

const router = Router();

router.post('/urls/shorten', shortenUrl);

router.get('/urls/:id', getUrlById);

router.get('/urls/open/:shortUrl', redirectUrl);

router.delete('/urls/:id', deleteUrl);

export default router;
