import z from 'zod';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { api } from '@workspace/backend/api';
import { sValidator } from '@hono/standard-validator';

import { convex } from '../lib/convex';
import { env } from '../data/env';

const JWT_EXPIRATION_SECONDS = 24 * 60 * 60;

const app = new Hono();

const registerSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(1),
});

app.post('/register', sValidator('json', registerSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const existing = await convex.query(api.users.getByEmail, { email });
  if (existing != null) {
    return c.json({ error: 'Email already in use' }, 409);
  }

  const passwordHash = await convex.action(api.crypto.hashPassword, {
    password,
  });
  const user = await convex.mutation(api.users.create, {
    email,
    passwordHash,
  });

  return c.json(user, 201);
});

app.post('/login', sValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const user = await convex.query(api.users.getByEmail, { email });
  if (user == null) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const valid = await convex.action(api.crypto.verifyPassword, {
    password,
    storedHash: user.passwordHash,
  });
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const now = Math.floor(Date.now() / 1000);

  const token = await sign(
    { exp: now + JWT_EXPIRATION_SECONDS, sub: user._id, email: user.email },
    env.JWT_SECRET,
    'HS256'
  );

  return c.json({ token });
});

export default app;
