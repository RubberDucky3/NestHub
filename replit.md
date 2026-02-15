# HomeHub - Family Household Management App

## Overview

HomeHub is a full-stack household management application designed for families to coordinate daily life. It provides shared task management (with gamification points), collaborative shopping lists, a family calendar, and sticky notes — all organized around a "Household" concept that members can create or join via invite codes.

The app follows a monorepo structure with a React frontend (`client/`), Express backend (`server/`), and shared types/schemas (`shared/`). Authentication is handled via Replit Auth (OpenID Connect).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Directory Structure
- `client/` — React SPA (Vite, TypeScript, Tailwind CSS, shadcn/ui)
- `server/` — Express API server (TypeScript, runs via tsx)
- `shared/` — Shared schemas, types, and API route definitions used by both client and server
- `migrations/` — Drizzle ORM migration files
- `script/` — Build scripts (esbuild for server, Vite for client)

### Frontend Architecture
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Forms**: react-hook-form with Zod validation via @hookform/resolvers
- **Icons**: lucide-react
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Pages
- `AuthPage` — Landing/login page (redirects to Replit Auth)
- `Dashboard` — Overview with stats (pending tasks, today's events, leaderboard)
- `Tasks` — Task board with create/complete/delete, assignable to household members, point values
- `Shopping` — Collaborative shopping list with add/check-off/delete
- `Calendar` — Event list view with create/delete
- `Notes` — Colorful sticky notes board
- `Settings` — Household info, invite code, member list

### Backend Architecture
- **Framework**: Express.js running on Node.js
- **Entry point**: `server/index.ts` creates HTTP server, registers routes, serves static files
- **API pattern**: RESTful JSON API under `/api/` prefix
- **Route definitions**: Centralized in `shared/routes.ts` with Zod schemas for input validation and response types — both client and server reference the same route definitions
- **Storage layer**: `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class using Drizzle ORM
- **Dev mode**: Vite dev server middleware with HMR (`server/vite.ts`)
- **Production**: Static file serving from `dist/public` (`server/static.ts`)

### Data Storage
- **Database**: PostgreSQL (required, via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod conversion
- **Schema location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Schema push**: `npm run db:push` (uses drizzle-kit)

### Database Tables
- `users` — User profiles (synced from Replit Auth)
- `sessions` — Express session storage (required for Replit Auth)
- `households` — Family groups with unique 6-character join codes
- `household_members` — Links users to households with roles (admin/member)
- `tasks` — Household tasks with assignee, points, completion status, due dates
- `shopping_items` — Shared shopping list items with completion tracking
- `events` — Calendar events with title, description, location, start/end times
- `sticky_notes` — Colored notes with content and author

### Authentication & Authorization
- **Method**: Replit Auth via OpenID Connect (OIDC)
- **Implementation**: `server/replit_integrations/auth/` handles passport.js strategy, session management, and user upsert
- **Session store**: PostgreSQL-backed via `connect-pg-simple`
- **Flow**: Unauthenticated users see the AuthPage; authenticated users without a household see the HouseholdSetup flow; authenticated users with a household see the main app
- **Required env vars**: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`, `ISSUER_URL`

### Household Context
- Every data operation is scoped to a household
- Users must create or join a household before accessing the app
- Join codes are 6-character alphanumeric strings
- The `requireHousehold` helper in routes ensures household membership before data access

### Build System
- **Dev**: `npm run dev` — tsx runs the server with Vite middleware for HMR
- **Build**: `npm run build` — Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Production**: `npm start` — Node runs the bundled server which serves static files

## External Dependencies

### Database
- **PostgreSQL** — Primary data store, required via `DATABASE_URL` environment variable

### Authentication
- **Replit Auth (OIDC)** — OpenID Connect provider for user authentication
- **Passport.js** — Authentication middleware with OIDC strategy
- **connect-pg-simple** — PostgreSQL session store for Express sessions

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` / `drizzle-zod` — ORM, migrations, and Zod schema generation
- `@tanstack/react-query` — Server state management
- `zod` — Runtime schema validation (shared between client and server)
- `react-hook-form` — Form state management
- `wouter` — Client-side routing
- `date-fns` — Date formatting and manipulation
- `react-day-picker` — Calendar date picker component
- `recharts` — Charting library (available via shadcn chart component)
- `framer-motion` — Animation library
- `vaul` — Drawer component
- `embla-carousel-react` — Carousel component
- `nanoid` — Unique ID generation

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` — Runtime error overlay in development
- `@replit/vite-plugin-cartographer` — Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Dev banner (dev only)