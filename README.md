# Library Management System

A full-stack **Library Management System** monorepo built with [Bun workspaces](https://bun.sh/docs/install/workspaces), featuring a Hono REST API, Next.js admin dashboard, and Convex backend.

**Status:** The Convex backend, Hono REST API, and shared UI component library are fully implemented. The Next.js web dashboard is scaffolded but not yet feature-complete.

## Tech Stack

### Core
- **Runtime:** [Bun](https://bun.sh)
- **Monorepo:** Bun workspaces
- **Language:** TypeScript

### Applications
- **API Server:** [Hono](https://hono.dev) v4.12 — lightweight, fast web framework
- **Web Dashboard:** [Next.js](https://nextjs.org) 16 with App Router, dark mode support via `next-themes`
- **Database:** [Convex](https://www.convex.dev) — real-time backend-as-a-service

### Shared Packages
- **UI Library:** [shadcn/ui](https://ui.shadcn.com) v4 (`radix-nova` style) + [Tailwind CSS](https://tailwindcss.com) v4 + [Radix UI](https://www.radix-ui.com) — 55+ components
- **ESLint Config:** Shared ESLint configurations (base, Next.js, Hono, React) with Prettier integration
- **TypeScript Config:** Shared TypeScript configurations (base, Next.js, React library)

### Libraries
- **Validation:** [Zod](https://zod.dev) v4.4.3 with `@hono/standard-validator`
- **Authentication:**
  - JWT (JSON Web Tokens) for user login / registration
  - API Key authentication for resource CRUD operations
- **Documentation:** Swagger / OpenAPI with `@hono/swagger-ui`
- **Security:** Convex actions for password hashing (scrypt) and API key generation

## Features

### Implemented

- **Convex Backend:** Complete database schema with tables for users, authors, books, and API keys
- **Backend Functions:** Queries and mutations for users, authors, books, and API keys
- **Crypto Actions:** Password hashing (scrypt) and API key generation via Convex actions
- **REST API:** Full Hono v4.12 server with all routes implemented
- **User Authentication:** Register and login with email/password to receive a JWT token (24h expiry)
- **API Key Management:** Create, list, and revoke API keys (with optional expiration)
- **Library Management:** Full CRUD for **Authors** and **Books** via REST API
- **Role-Based Access Control:**
  - **Admins** can modify any book
  - **Regular users** can only modify books they created
- **Request Validation:** All incoming JSON payloads validated using Zod schemas
- **Auto-generated Docs:** Interactive Swagger UI at `/docs`
- **API Key Authentication:** Middleware for protecting author and book write operations
- **Environment Validation:** Zod-validated environment variables with clear error messages
- **UI Component Library:** 56 shadcn/ui v4 components (radix-nova style) with Tailwind CSS v4
- **Shared Packages:** Reusable ESLint configs, TypeScript configs, and UI components across the monorepo
- **Web Dashboard Scaffold:** Next.js 16 with App Router, dark mode support via `next-themes`

### Planned

- **Admin Dashboard UI:** Full-featured web interface for managing the library

## Project Structure

```
.
├── apps/
│   ├── api/                    # Hono REST API server (api)
│   │   ├── src/
│   │   │   ├── routes/         # API route handlers (auth, apiKey, author, book, swagger)
│   │   │   ├── middleware/     # Authentication middleware (API key validation)
│   │   │   ├── lib/            # Utilities (Convex client, date formatting)
│   │   │   ├── data/           # Environment validation
│   │   │   └── index.ts        # Entry point
│   │   └── swagger.json        # OpenAPI specification
│   └── web/                    # Next.js admin dashboard (web)
│       ├── app/                # App Router pages (layout, page)
│       ├── components/         # App-specific components (theme-provider)
│       ├── hooks/              # App-specific hooks (use-mobile)
│       └── lib/                # App-specific utilities
├── packages/
│   ├── backend/                # Convex backend (@workspace/backend)
│   │   └── convex/
│   │       ├── schema.ts       # Database schema (users, authors, books, apiKeys)
│   │       ├── users.ts        # User queries/mutations
│   │       ├── authors.ts      # Author queries/mutations
│   │       ├── books.ts        # Book queries/mutations
│   │       ├── apiKeys.ts      # API key queries/mutations
│   │       └── crypto.ts       # Crypto actions (password hashing, API key generation)
│   ├── ui/                     # Shared UI components (@workspace/ui)
│   │   ├── src/
│   │   │   ├── components/     # 56 shadcn/ui components (radix-nova style)
│   │   │   ├── hooks/          # Shared hooks (use-mobile)
│   │   │   ├── lib/            # Utility functions (cn helper)
│   │   │   └── styles/         # Global CSS with Tailwind v4 theme
│   │   └── components.json     # shadcn/ui configuration
│   ├── eslint-config/          # Shared ESLint configurations (@workspace/eslint-config)
│   │   ├── base.js             # Base TypeScript config
│   │   ├── next.js             # Next.js + React config
│   │   ├── react-internal.js   # React library config
│   │   └── hono.js             # Hono/Node config
│   └── typescript-config/      # Shared TypeScript configurations (@workspace/typescript-config)
│       ├── base.json           # Base config
│       ├── nextjs.json         # Next.js config
│       └── react-library.json  # React library config
└── package.json                # Root workspace configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- [Convex](https://www.convex.dev) account (free tier available)

### 1. Install dependencies

```sh
bun install
```

### 2. Set up Convex backend

Navigate to the backend package and start the Convex dev server:

```sh
cd packages/backend
bunx convex dev
```

This will:
- Prompt you to log in to Convex (if not already logged in)
- Create a new Convex project or link to an existing one
- Generate the `_generated` directory with type-safe API clients
- Provide you with deployment URLs

Copy the `CONVEX_URL` and `CONVEX_DEPLOYMENT` values to the appropriate `.env.local` files.

### 3. Configure environment variables

**apps/api/.env.local:**
```env
PORT=3000
CONVEX_URL=https://your-deployment.convex.cloud
JWT_SECRET=your_jwt_secret_key
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**packages/backend/.env.local:**
```env
CONVEX_DEPLOYMENT=dev:your-deployment-name
```

### 4. Start development servers

Start all services:

```sh
bun run dev
```

This uses [Turborepo](https://turbo.build) to start all dev servers concurrently. To run a specific package's dev server, navigate to its directory:

```sh
cd apps/api && bun run dev        # API server
cd apps/web && bun run dev        # Web dashboard
cd packages/backend && bun run dev # Convex dev server
```

The API will be available at `http://localhost:3000`. The web dashboard runs on the next available port (default `http://localhost:3001`).

## API Routes

### Authentication (JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive a JWT token (valid for 24h) |

### API Keys (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api-keys` | List all API keys for the authenticated user |
| `POST` | `/api-keys` | Create a new API key (optionally set `expiresAt`) |
| `DELETE` | `/api-keys/:id` | Revoke an API key |

### Authors (Public Read, API Key Required for Write)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/authors` | — | List all authors |
| `GET` | `/authors/:id` | — | Get a specific author |
| `POST` | `/authors` | `X-API-Key` | Create a new author |
| `PUT` | `/authors/:id` | `X-API-Key` | Update an author |
| `DELETE` | `/authors/:id` | `X-API-Key` | Delete an author |

### Books (Public Read, API Key Required for Write)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/books` | — | List all books (includes author info) |
| `GET` | `/books/:id` | — | Get a specific book (includes author info) |
| `POST` | `/books` | `X-API-Key` | Create a new book |
| `PUT` | `/books/:id` | `X-API-Key` | Update a book (owner or admin only) |
| `DELETE` | `/books/:id` | `X-API-Key` | Delete a book (owner or admin only) |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/docs` | Interactive Swagger UI |
| `GET` | `/swagger.json` | Raw OpenAPI specification |

## Authentication Flow

1. **Register / Login** via `/auth/register` or `/auth/login` to obtain a JWT token.
2. **Create an API Key** by sending the JWT token in the `Authorization: Bearer <token>` header to `POST /api-keys`.
3. **Use the API Key** for protected routes by including it in the `X-API-Key` header.

## Scripts

### Root Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all development servers via Turborepo |
| `bun run build` | Build all packages |
| `bun run lint` | Run ESLint across all packages |
| `bun run format` | Run Prettier across all packages |
| `bun run typecheck` | Run TypeScript type checking across all packages |

### Package-Specific Scripts

Each package also has its own scripts. Navigate to a package directory to run them:

```sh
cd apps/api
bun run dev        # Start API server with hot reload
bun run build      # No-op (Hono requires no build)
bun run lint       # Lint API code
bun run typecheck  # Type check API code

cd apps/web
bun run dev        # Start Next.js dev server
bun run build      # Build Next.js for production
bun run start      # Start Next.js production server
bun run lint       # Lint web code
bun run format     # Format web code with Prettier
bun run typecheck  # Type check web code

cd packages/backend
bun run dev        # Start Convex dev server
bun run lint       # Lint backend code
bun run typecheck  # Type check backend code
```

## Architecture

### Data Flow

1. **Web Dashboard** (`apps/web`) will communicate directly with **Convex Backend** (`packages/backend`) using Convex React hooks for real-time data
2. **API Server** (`apps/api`) handles REST authentication and calls **Convex Backend** via HTTP client for server-side operations
3. **Crypto operations** (password hashing, API key generation) run as Convex actions in the backend package

### Shared Packages

- **`@workspace/ui`**: Reusable React components built with shadcn/ui v4 (radix-nova style) and Tailwind CSS v4. Import components like:
  ```tsx
  import { Button } from "@workspace/ui/components/button"
  import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
  import { cn } from "@workspace/ui/lib/utils"
  ```

- **`@workspace/backend`**: Convex schema and functions. Import types like:
  ```tsx
  import { api } from "@workspace/backend/api"
  import type { Id } from "@workspace/backend/dataModel"
  ```

- **`@workspace/eslint-config`**: Shared ESLint configurations for consistent code quality (base, Next.js, Hono, React)

- **`@workspace/typescript-config`**: Shared TypeScript configurations for consistent type checking (base, Next.js, React library)

## License

MIT
