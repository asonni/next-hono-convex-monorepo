# Project Knowledge Base

## Overview

This is a full-stack monorepo using Turborepo, Bun workspaces, and TypeScript. The architecture separates concerns into:

- **API Server**: Hono-based REST API (Node.js runtime)
- **Web Dashboard**: Next.js 16 frontend with React 19
- **Backend**: Convex serverless functions and database
- **Shared Packages**: Reusable UI components, TypeScript configs, and ESLint configs

## Tech Stack

### Core

- **Runtime**: Bun 1.3.14 (package manager), Node.js 20+ (execution)
- **Monorepo**: Turborepo 2.9 + Bun workspaces
- **Language**: TypeScript 5.x (strict mode, NodeNext resolution)
- **Build**: Turborepo orchestration, `tsc` for API, `next build` for web

### Applications

- **API**: Hono 4.12 (web framework), Zod 4.4 (validation), Convex HTTP client
- **Web**: Next.js 16.2, React 19.2, Tailwind CSS 4, next-themes
- **Backend**: Convex 1.39 (serverless functions + real-time database)

### Shared Packages

- **UI Library**: shadcn/ui v4 (radix-nova style), 56 components, Tailwind CSS 4
- **ESLint Config**: Shared configs for base, Next.js, Hono, React
- **TypeScript Config**: Shared configs (base, nextjs, react-library)

## Folder Structure

```
.
├── apps/
│   ├── api/                    # Hono REST API
│   │   ├── src/
│   │   │   ├── routes/         # Route handlers
│   │   │   ├── middleware/     # Custom middleware
│   │   │   ├── lib/            # Utilities
│   │   │   ├── data/           # Environment validation
│   │   │   └── index.ts        # Entry point
│   │   ├── dist/               # Compiled output (gitignored)
│   │   ├── tsconfig.json       # NodeNext module resolution
│   │   └── package.json        # "type": "module", build: "tsc"
│   └── web/                    # Next.js dashboard
│       ├── app/                # App Router pages
│       ├── components/         # App-specific components
│       └── tsconfig.json       # Extends nextjs config
├── packages/
│   ├── backend/                # Convex backend
│   │   ├── convex/
│   │   │   ├── schema.ts       # Database schema
│   │   │   ├── *.ts            # Queries, mutations, actions
│   │   │   └── _generated/     # Auto-generated types (gitignored)
│   │   ├── tsconfig.json       # Extends base config
│   │   └── package.json        # Exports: ./api, ./dataModel
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── components/     # shadcn/ui components
│   │   │   ├── hooks/          # Shared hooks
│   │   │   ├── lib/            # Utilities (cn helper)
│   │   │   └── styles/         # Global CSS
│   │   ├── components.json     # shadcn/ui config
│   │   └── package.json        # Exports: ./components/*, ./hooks/*, ./lib/*
│   ├── eslint-config/          # Shared ESLint configs
│   └── typescript-config/      # Shared TypeScript configs
├── turbo.json                  # Turborepo configuration
└── package.json                # Root workspace config
```

## Development Commands

### Root Commands (run from project root)

```bash
bun run dev          # Start all dev servers (Turborepo)
bun run build        # Build all packages
bun run typecheck    # Type-check all packages
bun run lint         # Lint all packages
bun run format       # Format all packages
```

### Package-Specific Commands

```bash
# API
cd apps/api
bun run dev          # Start API with hot reload
bun run build        # Compile TypeScript to dist/
bun run typecheck    # Type-check only

# Web
cd apps/web
bun run dev          # Start Next.js dev server
bun run build        # Build for production
bun run typecheck    # Type-check only

# Backend
cd packages/backend
bun run dev          # Start Convex dev server
bun run typecheck    # Type-check only
```

## TypeScript Configuration

### Module Resolution

- **Root/Base**: `NodeNext` module and resolution
- **API**: `NodeNext` (compiles to dist/)
- **Web**: `Bundler` (Next.js handles bundling)
- **Backend**: `NodeNext` (Convex handles bundling)
- **UI**: `Bundler` (library mode)

### Critical: ESM Import Extensions

**All relative imports MUST include `.js` extensions**, even in `.ts` files:

```typescript
// ✅ CORRECT
import { helper } from './lib/utils.js';
import { Component } from '../components/Button.js';

// ❌ WRONG - will fail at runtime
import { helper } from './lib/utils';
import { Component } from '../components/Button';
```

This applies to:

- All files in `apps/api/src/`
- All files in `packages/backend/convex/`
- Any TypeScript file that will be compiled with `tsc` using NodeNext resolution

### Strict Mode Features

- `strict: true` - All strict checks enabled
- `noUncheckedIndexedAccess: true` - Array/object access returns `T | undefined`
- `skipLibCheck: true` - Skip checking .d.ts files

## Package Relationships

### Importing from Workspace Packages

**Backend package** (`@workspace/backend`):

```typescript
import { api } from '@workspace/backend/api';
import type { Id } from '@workspace/backend/dataModel';

// Use typed API
const user = await convex.query(api.users.getById, { id: userId as Id<'users'> });
```

**UI package** (`@workspace/ui`):

```typescript
import { Button } from '@workspace/ui/components/button';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';
import { cn } from '@workspace/ui/lib/utils';
import '@workspace/ui/globals.css';
```

### Package Exports Pattern

Packages use the `exports` field in `package.json`:

```json
{
  "exports": {
    "./api": {
      "types": "./convex/_generated/api.d.ts",
      "default": "./convex/_generated/api.js"
    }
  }
}
```

This allows deep imports like `@workspace/backend/api` while hiding internal structure.

## Convex Backend Conventions

### File Structure

- `convex/schema.ts` - Database schema definition
- `convex/*.ts` - Queries, mutations, actions (one file per domain)
- `convex/_generated/` - Auto-generated types (never edit, gitignored)

### Function Types

```typescript
// Query - read data
export const getById = query({
  args: { id: v.id('users') },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

// Mutation - write data
export const create = mutation({
  args: { name: v.string() },
  handler: async ({ db }, { name }) => {
    return await db.insert('items', { name, createdAt: Date.now() });
  },
});

// Action - side effects (HTTP calls, crypto, etc.)
export const hashPassword = action({
  args: { password: v.string() },
  handler: async (_, { password }) => {
    return await bcrypt.hash(password, 10);
  },
});
```

### Type Safety

- Use `Id<'tableName'>` for document IDs (branded types)
- Use `v.id('tableName')` in args validation
- Cast string IDs from HTTP params: `id as Id<'users'>`

## Hono API Conventions

### Route Organization

```typescript
// src/routes/users.ts
import { Hono } from 'hono';
import { api } from '@workspace/backend/api';
import type { Id } from '@workspace/backend/dataModel';

const app = new Hono();

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = await convex.query(api.users.getById, {
    id: id as Id<'users'>
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user);
});

export default app;

// src/index.ts
import usersRoutes from './routes/users.js';

const app = new Hono();
app.route('/users', usersRoutes);

export default app;
```

### Validation with Zod

```typescript
import { z } from 'zod';
import { sValidator } from '@hono/standard-validator';

const createSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
});

app.post('/', sValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json'); // Fully typed
  // ...
});
```

### Middleware Pattern

```typescript
import { createMiddleware } from 'hono/factory';

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Validate token, set user context
  c.set('user', { id: '123', role: 'admin' });
  await next();
});
```

## Next.js Web Conventions

### App Router Structure

```
apps/web/app/
├── layout.tsx          # Root layout (providers, fonts)
├── page.tsx            # Home page
├── globals.css         # Global styles (import from @workspace/ui)
└── (dashboard)/        # Route group
    ├── layout.tsx      # Dashboard layout
    └── page.tsx        # Dashboard home
```

### Using UI Components

```typescript
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import '@workspace/ui/globals.css';

export default function Page() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

### Dark Mode

```typescript
import { ThemeProvider } from 'next-themes';

// In layout.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

## Environment Variables

### API (apps/api/.env.local)

```env
PORT=3000
CONVEX_URL=https://your-deployment.convex.cloud
JWT_SECRET=your-secret-key
```

### Web (apps/web/.env.local)

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Backend (packages/backend/.env.local)

```env
CONVEX_DEPLOYMENT=dev:your-deployment-name
```

### Validation Pattern

```typescript
// apps/api/src/data/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CONVEX_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

## Common Patterns

### Date Serialization

```typescript
// Convert Convex timestamps (numbers) to ISO strings
function serializeDates<T>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'number') {
      result[field] = new Date(result[field] as number).toISOString();
    }
  }
  return result;
}
```

### Error Handling

```typescript
// API route error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});
```

### Type-Safe Context Passing

```typescript
// Define context type
type Env = {
  Variables: {
    user: { id: string; role: string };
  };
};

const app = new Hono<Env>();

// Set in middleware
c.set('user', { id: '123', role: 'admin' });

// Get in handler
const user = c.get('user');
// or
const user = c.var.user;
```

## Dummy API Examples

These are generic examples, not from this project:

### Basic CRUD API

```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { sValidator } from '@hono/standard-validator';

const app = new Hono();

// In-memory store (replace with database)
const items = new Map<string, { id: string; name: string }>();

// List all items
app.get('/items', (c) => {
  return c.json(Array.from(items.values()));
});

// Get single item
app.get('/items/:id', (c) => {
  const id = c.req.param('id');
  const item = items.get(id);

  if (!item) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json(item);
});

// Create item
const createSchema = z.object({
  name: z.string().min(1),
});

app.post('/items', sValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const item = { id, name: data.name };

  items.set(id, item);

  return c.json(item, 201);
});

// Update item
const updateSchema = z.object({
  name: z.string().min(1).optional(),
});

app.put('/items/:id', sValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id');
  const item = items.get(id);

  if (!item) {
    return c.json({ error: 'Not found' }, 404);
  }

  const data = c.req.valid('json');
  const updated = { ...item, ...data };
  items.set(id, updated);

  return c.json(updated);
});

// Delete item
app.delete('/items/:id', (c) => {
  const id = c.req.param('id');
  items.delete(id);

  return c.body(null, 204);
});

export default app;
```

### Authentication Middleware

```typescript
import { createMiddleware } from 'hono/factory';
import { sign, verify } from 'hono/jwt';

type AuthEnv = {
  Variables: {
    userId: string;
  };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing token' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verify(token, process.env.JWT_SECRET!);
    c.set('userId', payload.sub as string);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Usage
const protectedApp = new Hono<AuthEnv>();
protectedApp.use('*', authMiddleware);

protectedApp.get('/me', (c) => {
  const userId = c.get('userId');
  return c.json({ userId });
});
```

### File Upload

```typescript
import { Hono } from 'hono';

const app = new Hono();

app.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;

  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  // Process file (save to disk, upload to S3, etc.)
  const buffer = await file.arrayBuffer();

  return c.json({
    filename: file.name,
    size: file.size,
    type: file.type
  });
});

export default app;
```

## Deployment

### Vercel (Zero-Config)

- **API**: Auto-detected, runs `bun run build` (tsc), serves `dist/index.js`
- **Web**: Auto-detected as Next.js app
- **Environment Variables**: Declare in `turbo.json` build task's `env` array

### Turborepo Environment Variables

```json
{
  "tasks": {
    "build": {
      "env": ["CONVEX_URL", "JWT_SECRET", "PORT"]
    }
  }
}
```

## Common Issues

### "Cannot find module" errors

- **Cause**: Missing `.js` extension in relative imports
- **Fix**: Add `.js` to all relative imports: `import x from './file.js'`

### "Type 'string' is not assignable to type 'Id<...>'"

- **Cause**: Convex uses branded types for document IDs
- **Fix**: Cast strings: `id as Id<'users'>`

### Vercel build warnings about environment variables

- **Cause**: Env vars not declared in turbo.json
- **Fix**: Add to `tasks.build.env` array in `turbo.json`

### Backend type errors with NodeNext

- **Cause**: Backend imports missing `.js` extensions
- **Fix**: Add `.js` to all imports in `packages/backend/convex/*.ts`

## Testing

### API Testing with app.request()

```typescript
import app from './index.js';

// GET request
const res = await app.request('/items');
console.log(res.status); // 200

// POST with JSON
const res = await app.request('/items', {
  method: 'POST',
  body: JSON.stringify({ name: 'Test' }),
  headers: { 'Content-Type': 'application/json' },
});

// With auth header
const res = await app.request('/protected', {
  headers: { 'Authorization': 'Bearer token123' },
});
```

## Code Style

### Formatting

- Prettier with Tailwind CSS plugin
- Run `bun run format` to format all files

### Linting

- ESLint with shared configs
- Run `bun run lint` to check all packages

### Import Order

1. Node built-ins (`node:*`, `fs`, `path`)
2. External packages (`hono`, `zod`, `react`)
3. Workspace packages (`@workspace/*`)
4. Relative imports (`./`, `../`)

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions/Variables**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `UserId`)

## Additional Resources

- [Hono Documentation](https://hono.dev)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js 16 Documentation](node_modules/next/dist/docs/)
- [Turborepo Documentation](https://turbo.build/repo)
- [shadcn/ui Documentation](https://ui.shadcn.com)
