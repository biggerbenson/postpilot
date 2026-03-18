# Social Media Auto Poster — Product Architecture

## 1. Product Overview

A web-based SaaS that lets users:
- Create workspaces (brands)
- Connect social accounts (placeholder/OAuth-ready)
- Upload media and generate AI captions from brand profile
- Build a content plan and schedule posts
- Approve or auto-publish with a queue worker
- Track publish status and activity

## 2. Feature Breakdown

| Module | Features | Priority |
|--------|----------|----------|
| **Auth** | Register, login, logout, protected routes, forgot-password placeholder | P0 |
| **Dashboard** | Overview, workspace summary, post queue, recent activity, basic stats | P0 |
| **Workspace** | CRUD workspaces, brand profile fields, active workspace selection | P0 |
| **Social Accounts** | List, add placeholder accounts, store token fields, connection status | P0 |
| **Media Library** | Upload, gallery, detail, delete, tag, caption notes, validation | P0 |
| **AI Generation** | Single/batch caption generation, regenerate, variations, edit before save | P0 |
| **Scheduler** | Duration, frequency, times, approval mode, generate calendar from media | P0 |
| **Post Management** | List, filter, detail, edit, approve, reschedule, duplicate, delete | P0 |
| **Publishing Engine** | Job structure, queue worker, platform interface, mock publisher, retries | P0 |
| **Activity Logs** | Key actions (workspace, media, AI, approve, schedule, publish) | P0 |
| **Settings** | Profile, timezone, default approval mode, posting prefs | P0 |

## 3. Folder Structure

```
Auto Poster/
├── app/
│   ├── (auth)/                    # Auth layout group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/               # Protected dashboard layout
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── workspaces/
│   │   ├── media/
│   │   ├── generate/
│   │   ├── posts/
│   │   ├── accounts/
│   │   └── settings/
│   ├── api/                       # API routes
│   │   ├── auth/[...nextauth]/
│   │   ├── workspaces/
│   │   ├── media/
│   │   ├── posts/
│   │   ├── generate/
│   │   ├── accounts/
│   │   ├── activity/
│   │   └── settings/
│   ├── layout.tsx
│   ├── page.tsx                   # Landing
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn components
│   ├── layout/                    # Sidebar, header, etc.
│   └── shared/                    # Reusable (EmptyState, etc.)
├── features/
│   ├── auth/
│   ├── workspace/
│   ├── media/
│   ├── generate/
│   ├── posts/
│   ├── accounts/
│   ├── dashboard/
│   └── settings/
├── lib/
│   ├── auth.ts
│   ├── db.ts                     # Prisma client singleton
│   ├── validations/              # Zod schemas
│   └── utils.ts
├── server/
│   ├── actions/                  # Server actions (optional)
│   ├── services/                 # Business logic
│   │   ├── ai/
│   │   ├── media/
│   │   ├── publish/
│   │   └── queue/
│   └── auth.ts
├── workers/
│   └── publish-worker.ts         # BullMQ worker entry
├── types/
│   └── index.ts
├── hooks/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── docs/
│   └── ARCHITECTURE.md
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 4. Core API / Module Map

| Area | Route/Module | Purpose |
|------|--------------|---------|
| Auth | `/api/auth/[...nextauth]` | NextAuth handlers |
| Workspaces | `/api/workspaces` | CRUD workspaces |
| Media | `/api/workspaces/[id]/media` | Upload, list, delete media |
| Posts | `/api/workspaces/[id]/posts` | CRUD posts, filters |
| Generate | `/api/generate/caption` | AI caption generation |
| Accounts | `/api/workspaces/[id]/accounts` | Social account CRUD |
| Activity | `/api/workspaces/[id]/activity` | Activity log list |
| Settings | `/api/settings` | User settings |
| Publish | Internal (queue) | Worker calls publish service |

## 5. Key Enums and Relationships

See `prisma/schema.prisma` for full schema. Summary:

- **Platform**: INSTAGRAM, FACEBOOK, LINKEDIN, X, TIKTOK
- **PostStatus**: DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, PUBLISHING, PUBLISHED, FAILED, CANCELLED
- **MediaType**: IMAGE, VIDEO
- **ConnectionStatus**: PENDING, CONNECTED, EXPIRED, ERROR, DISCONNECTED
- **ApprovalMode**: MANUAL, AUTO
- **PublishResultType**: SUCCESS, FAILURE, RETRY

Relationships:
- User → Workspace (one-to-many; owner)
- Workspace → BrandProfile (embedded or 1:1)
- Workspace → SocialAccount, MediaAsset, Post, ActivityLog
- Post → MediaAsset (optional), SocialAccount, PublishLog

## 6. Environment Variables

```
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/autoposter"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Redis (BullMQ)
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="sk-..."

# File storage (MVP: local; prod: S3/R2)
STORAGE_TYPE="local"
STORAGE_LOCAL_PATH="./uploads"
# For S3/R2 later:
# STORAGE_TYPE="s3"
# S3_BUCKET=
# S3_REGION=
# S3_ACCESS_KEY=
# S3_SECRET_KEY=

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 7. Implementation Roadmap

1. **Step 1** — Architecture, schema, env (this doc + Prisma schema)
2. **Step 2** — Project init, deps, Prisma, Auth.js, app layout, shadcn
3. **Step 3** — Auth: register, login, logout, middleware, forms
4. **Step 4** — Workspaces: CRUD, brand profile, active workspace
5. **Step 5** — Media: upload, storage abstraction, gallery, tags
6. **Step 6** — AI: prompt builder, OpenAI service, generate API, UI
7. **Step 7** — Posts: scheduler logic, post CRUD, calendar/list UI
8. **Step 8** — Queue: BullMQ, worker, mock publisher, retries
9. **Step 9** — Dashboard, activity log API and UI
10. **Step 10** — Validation, loading/error states, README, polish
