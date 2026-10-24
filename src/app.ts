import express, { type Express } from 'express';
import routes from './routes/route.ts';
import { errorHandler, notFound } from './middleware/error.handler.ts';

export const app: Express = express();

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(routes);
app.use(notFound);
app.use(errorHandler);
