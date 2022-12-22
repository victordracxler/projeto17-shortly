import { connection } from '../database/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export async function signUp(req, res) {
	const { name, email, password, confirmPassword } = req.body;

	if (password != confirmPassword) {
		res.sendStatus(401);
		return;
	}

	try {
		const userExists = await connection.query(
			`
        SELECT email
        FROM users
        WHERE email = $1;
        `,
			[email]
		);

		if (userExists.rows.length != 0) {
			res.status(409).send({ message: 'email already used' });
			return;
		}

		const hashPass = bcrypt.hashSync(password, 10);

		await connection.query(
			`
        INSERT INTO users (name, email, "hashPassword")
        VALUES ($1, $2, $3);
        `,
			[name, email, hashPass]
		);

		res.sendStatus(201);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export async function signIn(req, res) {
	const { email, password } = req.body;

	try {
		const user = await connection.query(
			`
        SELECT *
        FROM users
        WHERE email = $1;
        `,
			[email]
		);

		if (user.rows.length === 0) {
			res.sendStatus(401);
			return;
		}

		const passwordCompare = bcrypt.compareSync(
			password,
			user.rows[0].hashPassword
		);

		if (!passwordCompare) {
			res.sendStatus(401);
			return;
		}

		const sessionExists = await connection.query(
			`
        SELECT *
        FROM sessions
        WHERE "userId" = $1;
        `,
			[user.rows[0].id]
		);

		if (sessionExists.rows.length != 0) {
			await connection.query(
				`
            DELETE
            FROM sessions
            WHERE "userId" = $1;
            `,
				[user.rows[0].id]
			);
		}

		const newToken = uuid();

		await connection.query(
			`
        INSERT INTO sessions ("userId", token)
        VALUES ($1, $2);
        `,
			[user.rows[0].id, newToken]
		);

		res.status(200).send(newToken);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}
