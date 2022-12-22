import { connection } from '../database/db.js';
import bcrypt from 'bcrypt';

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
        WHERE email = $1
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
        VALUES ($1, $2, $3)
        `,
			[name, email, hashPass]
		);

		res.sendStatus(201);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export async function signIn(req, res) {}
