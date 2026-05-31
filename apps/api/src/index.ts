import { Hono } from 'hono';

import authorRoutes from './routes/author.js';
import authRoutes from './routes/auth.js';
import apiKeyRoutes from './routes/apiKey.js';
import bookRoutes from './routes/book.js';
import swaggerRoute from './routes/swagger.js';

const app = new Hono();

app.route('/authors', authorRoutes);
app.route('/books', bookRoutes);
app.route('/auth', authRoutes);
app.route('/api-keys', apiKeyRoutes);
app.route('/docs', swaggerRoute);

export default app;
