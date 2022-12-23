import { connection } from '../database/db.js';
import { nanoid } from 'nanoid';

export async function shortenUrl(req, res) {
	const { url } = req.body;
	const authorization = req.headers.authorization;
	const token = authorization?.replace('Bearer ', '');

	if (token?.length === 0) {
		res.sendStatus(401);
		return;
	}

	try {
		const session = await connection.query(
			`
        SELECT *
        FROM sessions
        WHERE token =$1;
        `,
			[token]
		);

		if (session.rows.length === 0) {
			res.sendStatus(401);
			return;
		}

		const userId = session.rows[0].userId;
		const shortUrl = nanoid();

		await connection.query(
			`
        INSERT INTO urls ("userId", "longUrl", "shortUrl")
        VALUES ($1, $2, $3);
        `,
			[userId, url, shortUrl]
		);

		res.status(201).send({ shortUrl: shortUrl });
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export async function getUrlById(req, res) {
	const { id } = req.params;

	try {
		const findUrl = await connection.query(
			`
        SELECT id, "shortUrl", "longUrl" AS "url"
        FROM urls
        WHERE id = $1;
        `,
			[id]
		);

		if (findUrl.rows.length === 0) {
			res.sendStatus(404);
			return;
		}

		res.status(200).send(findUrl.rows[0]);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export async function redirectUrl(req, res) {
	const { shortUrl } = req.params;

	try {
		const urlInfo = await connection.query(
			`
        SELECT *
        FROM urls
        WHERE "shortUrl" = $1;
        `,
			[shortUrl]
		);

		if (urlInfo.rows.length === 0) {
			res.sendStatus(404);
			return;
		}

		const urlId = urlInfo.rows[0].id;
		const newVisits = urlInfo.rows[0].visits + 1;

		await connection.query(
			`
        UPDATE urls
        SET visits = $1
        WHERE id = $2;
        `,
			[newVisits, urlId]
		);

		res.redirect(302, urlInfo.rows[0].longUrl);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export async function deleteUrl(req, res) {
	const { id } = req.params;
	const urlId = id;

	const authorization = req.headers.authorization;
	const token = authorization?.replace('Bearer ', '');

	if (token?.length === 0) {
		res.sendStatus(401);
		return;
	}

	try {
		const session = await connection.query(
			`
        SELECT *
        FROM sessions
        WHERE token =$1;
        `,
			[token]
		);

		if (session.rows.length === 0) {
			res.sendStatus(401);
			return;
		}

		const userId = session.rows[0].userId;

		const urlInfo = await connection.query(
			`
        SELECT *
        FROM urls
        WHERE id = $1;
        `,
			[urlId]
		);

		if (urlInfo.rows.length === 0) {
			res.sendStatus(404);
			return;
		}

		if (userId != urlInfo.rows[0].userId) {
			res.sendStatus(401);
			return;
		}

		await connection.query(
			`
        DELETE
        FROM urls
        WHERE id = $1;
        `,
			[urlId]
		);

		res.sendStatus(204);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}
