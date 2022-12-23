import { connection } from '../database/db.js';

export async function getMe(req, res) {
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

		const userStats = await connection.query(
			`
        SELECT users.id, users.name, SUM(urls."visitCount") AS "visitCount", 
        JSON_AGG(urls) AS "shortenedUrls"
        FROM users
        JOIN urls
        ON users.id = urls."userId"
        WHERE users.id= $1
        GROUP BY users.id;
        `,
			[userId]
		);

		res.status(200).send(userStats.rows[0]);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export async function rankUsers(req, res) {
	try {
		const ranking = await connection.query(`
        SELECT users.id, users.name, COUNT(urls."userId") AS "linksCount", SUM(COALESCE(urls."visitCount", 0)) AS "visitCount"
        FROM users
        LEFT JOIN urls
        ON users.id = urls."userId"
        GROUP BY users.id
        ORDER BY "visitCount" DESC, "linksCount" DESC
        LIMIT 10;
        `);

		res.status(200).send(ranking.rows);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}
