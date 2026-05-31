import z from 'zod';
import { Hono } from 'hono';
import { api } from '@workspace/backend/api';
import type { Id } from '@workspace/backend/dataModel';
import { sValidator } from '@hono/standard-validator';

import { convex } from '../lib/convex.js';
import { serializeDates } from '../lib/dates.js';
import { apiKeyAuth, type ApiKeyEnv } from '../middleware/auth.js';

const app = new Hono();

const createAuthorSchema = z.object({
  name: z.string().min(1),
  birthday: z.coerce.date().optional(),
});

const updateAuthorSchema = z.object({
  name: z.string().min(1).optional(),
  birthday: z.coerce.date().nullable().optional(),
});

app.get('/', async (c) => {
  const authors = await convex.query(api.authors.list, {});
  return c.json(
    authors.map((a: Record<string, unknown>) =>
      serializeDates(a, ['birthday', 'createdAt'])
    )
  );
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const author = await convex.query(api.authors.getById, { id: id as Id<'authors'> });

  if (author == null) {
    return c.json({ error: 'Author not found' }, 404);
  }

  return c.json(serializeDates(author, ['birthday', 'createdAt']));
});

const protectedApp = new Hono<ApiKeyEnv>();
protectedApp.use(apiKeyAuth);

protectedApp.post('/', sValidator('json', createAuthorSchema), async (c) => {
  const data = c.req.valid('json');
  const author = await convex.mutation(api.authors.create, {
    name: data.name,
    birthday: data.birthday?.getTime(),
  });

  if (author == null) {
    return c.json({ error: 'Failed to create author' }, 500);
  }

  return c.json(serializeDates(author, ['birthday', 'createdAt']), 201);
});

protectedApp.put('/:id', sValidator('json', updateAuthorSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const author = await convex.mutation(api.authors.update, {
    id: id as Id<'authors'>,
    name: data.name,
    birthday: data.birthday === null ? null : data.birthday?.getTime(),
  });

  if (author == null) {
    return c.json({ error: 'Author not found' }, 404);
  }

  return c.json(serializeDates(author, ['birthday', 'createdAt']));
});

protectedApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await convex.mutation(api.authors.remove, { id: id as Id<'authors'> });

  return c.body(null, 204);
});

app.route('/', protectedApp);

export default app;
