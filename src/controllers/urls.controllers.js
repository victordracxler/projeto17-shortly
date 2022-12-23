import { connection } from '../database/db.js';
import { nanoid } from 'nanoid';

export async function shortenUrl(req, res) {
	const { url } = req.body;
	const authorization = req.headers.authorization;
	const token = authorization?.replace('Bearer ', '');

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
