# Social Media Auto Poster

A web-based SaaS MVP for automating social media content: upload media, generate AI captions from your brand profile, schedule posts, and publish (with a mock publisher for development).

## Features

- **Auth**: Register, login, logout, protected dashboard
- **Workspaces**: Create/edit brands with full brand profile (tone, audience, goals, CTA, etc.)
- **Social accounts**: Placeholder connections (Instagram, Facebook, LinkedIn, X, TikTok) — OAuth-ready
- **Media library**: Upload images/videos, tags, caption notes, campaign notes
- **AI captions**: OpenAI-powered caption generation from brand profile + media context
- **Scheduler**: Plan duration, frequency, times; generate a queue of draft/pending posts
- **Post management**: List, filter, edit, approve, reschedule, delete posts
- **Publishing**: BullMQ queue + mock publisher; retry logic; publish logs
- **Activity logs**: Track workspace/media/post/publish actions
- **Settings**: Timezone, default approval mode, posting preferences

## Tech stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn-style UI, React Hook Form + Zod, TanStack Query
- **Backend**: Next.js API routes, server services
- **Database**: PostgreSQL, Prisma
- **Auth**: NextAuth (Auth.js) with credentials + Prisma adapter (OAuth-ready)
- **Queue**: Redis + BullMQ
- **AI**: OpenAI API (configurable model via env)
- **Storage**: Abstraction for local (MVP) or S3/R2 later

## Prerequisites

- Node.js 20+
- PostgreSQL
- Redis (for queue/worker)
- OpenAI API key

## Setup

1. **Clone and install**

   ```bash
   cd "Auto Poster"
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/social_auto_poster"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret"   # e.g. openssl rand -base64 32
   REDIS_URL="redis://localhost:6379"
   OPENAI_API_KEY="sk-..."
   STORAGE_TYPE="local"
   STORAGE_LOCAL_PATH="./uploads"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   # Optional: for cron enqueue route
   CRON_SECRET="optional-cron-secret"
   ```

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **Run publish worker** (separate terminal)

   The worker processes the publish queue. Due posts must be enqueued first.

   **Option A — Cron (recommended for production)**  
   Call `GET /api/cron/enqueue` every minute (e.g. Vercel Cron, cron job) with optional `Authorization: Bearer <CRON_SECRET>`. Then run the worker:

   ```bash
   npm run worker
   ```

   **Option B — Local dev**  
   Run the worker; it only processes jobs. To enqueue due posts, either call the cron route manually or use a separate script that calls `enqueueDuePosts()` on an interval.

## Project structure

- `app/` — Next.js App Router (auth, dashboard, API routes)
- `components/` — UI (shadcn-style) and layout
- `features/` — Feature-specific UI (workspace, media, generate, posts, accounts, settings)
- `lib/` — Auth config, db client, queue, validations, utils
- `server/` — Services (workspace, media, AI, schedule, publish, storage)
- `workers/` — BullMQ publish worker
- `prisma/` — Schema and migrations

## MVP flow

1. Sign up → create workspace → add brand profile.
2. Add a placeholder social account (Accounts).
3. Upload media in Media library.
4. Generate captions in Generate (optionally edit and save as a post later).
5. In Posts, click “Create schedule”: pick workspace, account, duration, frequency, times, approval mode, media; creates many draft/pending posts.
6. Open each post to edit caption, approve, and set schedule (or use approval mode AUTO).
7. Run the worker and enqueue cron so that when `scheduledAt` is past, posts are enqueued and the mock publisher marks them published/failed.

## Security

- Protected routes via NextAuth middleware.
- All workspace-scoped APIs check `assertWorkspaceAccess(workspaceId, userId)`.
- Input validation with Zod on API routes.
- File upload: type and size checks; files stored outside public.
- No secrets in client; env for API keys and cron secret.

## License

Private / use as needed.
