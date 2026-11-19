import express from 'express';
import routes from './Routes';
import { errorHandler, notFoundHandler } from './Middlewares/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'OK' });
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;