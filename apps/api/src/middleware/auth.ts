import { createMiddleware } from 'hono/factory';
import { api } from '@workspace/backend/api';

import { convex } from '../lib/convex.js';

export type ApiKeyEnv = {
  Variables: {
    apiKeyUser: { id: string; role: string; email: string };
  };
};

export const apiKeyAuth = createMiddleware<ApiKeyEnv>(async (c, next) => {
  const key = c.req.header('X-API-Key');
  if (key == null || key.trim() === '') {
    return c.json({ error: 'Missing API Key' }, 401);
  }

  const keyHash = await convex.action(api.crypto.hashApiKey, { key });
  const result = await convex.query(api.apiKeys.getByHash, { keyHash });

  if (result == null) {
    return c.json({ error: 'Invalid API Key' }, 401);
  }

  if (result.expiresAt && result.expiresAt < Date.now()) {
    return c.json({ error: 'API Key has expired' }, 401);
  }

  c.set('apiKeyUser', {
    id: result.user.id,
    role: result.user.role,
    email: result.user.email,
  });
  await next();
});
