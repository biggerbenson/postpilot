# Social Media Auto Poster — Scaffold Order

Files are listed in the order they should exist for a clean scaffold. Each path is relative to project root. Full file contents for each path are in the codebase.

## 1. Root & config
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `.env.example`
- `next-env.d.ts`
- `middleware.ts`

## 2. Prisma
- `prisma/schema.prisma`

## 3. Types
- `types/index.ts`
- `types/next-auth.d.ts`

## 4. Lib
- `lib/db.ts`
- `lib/utils.ts`
- `lib/auth.ts`
- `lib/queue.ts`
- `lib/validations/auth.ts`
- `lib/validations/workspace.ts`
- `lib/validations/media.ts`
- `lib/validations/post.ts`
- `lib/validations/account.ts`

## 5. Server
- `server/auth.ts`
- `server/services/workspace.ts`
- `server/services/storage.ts`
- `server/services/media.ts`
- `server/services/ai/prompt-builder.ts`
- `server/services/ai/generate-caption.ts`
- `server/services/schedule.ts`
- `server/services/scheduler.ts`
- `server/services/publish/types.ts`
- `server/services/publish/mock-publisher.ts`
- `server/services/publish/index.ts`

## 6. Components (UI)
- `components/providers.tsx`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/card.tsx`
- `components/ui/select.tsx`
- `components/ui/toast.tsx`
- `components/ui/use-toast.ts`
- `components/ui/toaster.tsx`
- `components/layout/dashboard-nav.tsx`

## 7. App (root & auth)
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/register/route.ts`
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(auth)/forgot-password/page.tsx`

## 8. App (dashboard & workspace)
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/workspaces/page.tsx`
- `app/(dashboard)/workspaces/new/page.tsx`
- `app/(dashboard)/workspaces/[id]/page.tsx`
- `app/api/workspaces/route.ts`
- `app/api/workspaces/[id]/route.ts`
- `features/workspace/workspace-form.tsx`

## 9. App (media)
- `app/(dashboard)/media/page.tsx`
- `app/(dashboard)/media/[id]/page.tsx`
- `app/api/media/serve/route.ts`
- `app/api/workspaces/[id]/media/route.ts`
- `app/api/workspaces/[id]/media/[assetId]/route.ts`
- `features/media/media-library.tsx`
- `features/media/media-detail-client.tsx`

## 10. App (generate & posts)
- `app/(dashboard)/generate/page.tsx`
- `app/api/generate/caption/route.ts`
- `features/generate/content-generator.tsx`
- `app/(dashboard)/posts/page.tsx`
- `app/(dashboard)/posts/schedule/page.tsx`
- `app/(dashboard)/posts/[id]/page.tsx`
- `app/api/workspaces/[id]/posts/route.ts`
- `app/api/workspaces/[id]/posts/[postId]/route.ts`
- `app/api/workspaces/[id]/schedule/route.ts`
- `features/posts/posts-list.tsx`
- `features/posts/schedule-form.tsx`
- `features/posts/post-detail-client.tsx`

## 11. App (accounts, activity, settings, cron)
- `app/(dashboard)/accounts/page.tsx`
- `app/api/workspaces/[id]/accounts/route.ts`
- `features/accounts/connected-accounts.tsx`
- `app/api/workspaces/[id]/activity/route.ts`
- `app/(dashboard)/settings/page.tsx`
- `app/api/settings/route.ts`
- `features/settings/settings-form.tsx`
- `app/api/cron/enqueue/route.ts`

## 12. Workers & docs
- `workers/publish-worker.ts`
- `docs/ARCHITECTURE.md`
- `README.md`
