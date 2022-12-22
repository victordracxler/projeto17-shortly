import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRouter);

const portAdress = process.env.PORT || 4000;
app.listen(portAdress, () =>
	console.log('Server running in port ' + portAdress)
);
