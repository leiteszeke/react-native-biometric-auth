import cors from 'cors';
import express from 'express';
import './database';
import routes from './routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

const port = process.env.PORT || 3500;

app.listen(port, () => console.log(`Server running in port ${port}`));
