# MailFlow - Email Scheduler Service

## Overview

MailFlow is a production-grade email scheduler service with a React dashboard. The application allows users to schedule bulk email campaigns using BullMQ + Redis as a persistent job queue, with emails sent via Ethereal Email (fake SMTP for testing). The system is designed to survive server restarts without losing scheduled jobs.

**Core Features:**
- Schedule bulk emails via CSV upload
- View scheduled, sent, and failed emails
- Rate limiting with hourly limits and configurable delays between emails
- Persistent job queue that survives restarts
- Replit Auth integration for user authentication

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a feature-based structure with pages (`Dashboard`, `Landing`), reusable components (`ComposeEmailDialog`, `EmailList`, `StatsCards`), and shared hooks (`use-auth`, `use-emails`).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Job Queue**: BullMQ backed by Redis for reliable email scheduling
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Authentication**: Replit Auth via OpenID Connect

**Key Backend Patterns:**
1. Routes are registered in `server/routes.ts` with Zod validation from shared schemas
2. Storage layer (`server/storage.ts`) abstracts database operations
3. Queue initialization is non-blocking to allow app startup even if Redis is unavailable
4. Email scheduling logic distributes emails respecting both delay intervals and hourly limits

### Data Storage
- **PostgreSQL Tables**:
  - `users` - User accounts from Replit Auth
  - `sessions` - Session storage for authentication
  - `emails` - Email records with status tracking (scheduled, processing, sent, failed, cancelled)

- **Drizzle ORM**: Schema defined in `shared/schema.ts` with type-safe queries
- **Migrations**: Located in `./migrations`, managed via `drizzle-kit push`

### API Structure
- Shared route definitions in `shared/routes.ts` with Zod schemas for input/output validation
- Protected routes require authentication via `isAuthenticated` middleware
- Endpoints: `/api/emails` (list), `/api/emails/schedule` (POST), `/api/emails/:id` (DELETE), `/api/emails/stats`

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `REDIS_URL` - Redis connection for BullMQ (falls back to localhost:6379)
- `SESSION_SECRET` - Secret for session encryption
- `ETHEREAL_EMAIL` / `ETHEREAL_PASSWORD` - Optional; auto-creates test account if not set
- `REPL_ID` / `ISSUER_URL` - Replit Auth configuration

### Third-Party Services
1. **PostgreSQL** - Primary database for users, sessions, and email records
2. **Redis** - Job queue backing store for BullMQ (gracefully degrades if unavailable)
3. **Ethereal Email** - Fake SMTP service for testing email delivery
4. **Replit Auth** - OpenID Connect authentication provider

### Key NPM Packages
- `bullmq` + `ioredis` - Persistent job queue
- `nodemailer` - Email sending
- `drizzle-orm` + `pg` - Database ORM and driver
- `passport` + `openid-client` - Authentication
- `papaparse` - Client-side CSV parsing for recipient lists
- `date-fns` - Date manipulation for scheduling logic