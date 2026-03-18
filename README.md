# Social Scheduler

A full-stack social media scheduling application built with Next.js 16, Supabase, and Prisma. Write posts once, schedule them for the right moment, and let the app publish automatically — no manual posting required.

Currently supports **LinkedIn** with Twitter and Instagram support coming soon.

---

## Features

- **Compose posts** with a rich editor supporting per-platform character limits (LinkedIn: 3,000 · Twitter: 280 · Instagram: 2,200)
- **Post Now or Schedule** — publish immediately or queue a post for a specific date and time
- **Post Queue** — view and manage all drafts, scheduled posts, published posts, and failures in one place
- **Edit & Delete** scheduled posts before they go out
- **Image attachments** — attach up to 4 images per post (LinkedIn image upload supported)
- **LinkedIn OAuth** — connect your LinkedIn account via OAuth 2.0 to post on your behalf
- **Auto-save drafts** to `localStorage` so you never lose work in progress
- **Cron-based publishing** — a Vercel Cron job checks every minute and publishes posts that are due
- **Supabase authentication** — email/password and Google OAuth sign-in via Supabase Auth
- **Responsive UI** — works on desktop and mobile
- **Dark/light mode** toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components) |
| Language | TypeScript 5 |
| Authentication | [Supabase Auth](https://supabase.com/docs/guides/auth) (email + Google OAuth) |
| Database ORM | [Prisma 6](https://www.prisma.io) |
| Database | PostgreSQL ([Supabase](https://supabase.com) or [Neon](https://neon.tech)) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Social API | [LinkedIn UGC Posts API v2](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api) |
| Cron Jobs | [Vercel Cron](https://vercel.com/docs/cron-jobs) |
| Deployment | [Vercel](https://vercel.com) |

---

## Prerequisites

- Node.js 18 or later
- A [Supabase](https://supabase.com) project (free tier works)
- A [LinkedIn Developer App](https://www.linkedin.com/developers/apps) with `openid`, `profile`, `email`, and `w_member_social` scopes
- (Optional) A [Neon](https://neon.tech) PostgreSQL database if not using Supabase's built-in Postgres

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/social-scheduler.git
cd social-scheduler
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. See the [Environment Variables](#environment-variables) table below for details.

You also need a `.env` file at the project root for the Prisma CLI (used by `npx prisma db push` and `npx prisma studio`):

```
DATABASE_URL=your-pooler-url
DIRECT_URL=your-direct-url
```

### 4. Push the database schema

```bash
npx prisma db push
```

This creates all tables (`User`, `SocialAccount`, `Post`, `PostPlatform`) in your database.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (found in Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role key (server-side only, never expose to the client) |
| `DATABASE_URL` | Yes | PostgreSQL connection string — use the **pooler** (PgBouncer) URL for serverless environments |
| `DIRECT_URL` | Yes | PostgreSQL direct connection string — used by Prisma for migrations |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL of the app (e.g. `https://your-app.vercel.app`). Used to construct LinkedIn OAuth redirect URIs. |
| `LINKEDIN_CLIENT_ID` | Yes | LinkedIn app client ID |
| `LINKEDIN_CLIENT_SECRET` | Yes | LinkedIn app client secret |
| `LINKEDIN_STATE_SECRET` | Yes | Random secret for signing the OAuth `state` parameter (CSRF protection). Generate with `openssl rand -base64 32`. |
| `CRON_SECRET` | Yes | Bearer token that Vercel sends when invoking the publish cron job. Must match the value set in Vercel → Environment Variables. Generate with `openssl rand -base64 32`. |

---

## How Scheduled Publishing Works

The app uses a **Vercel Cron Job** configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish",
      "schedule": "* * * * *"
    }
  ]
}
```

Every minute, Vercel calls `GET /api/cron/publish` with an `Authorization: Bearer <CRON_SECRET>` header.

The endpoint:
1. Verifies the `Authorization` header against `CRON_SECRET` and returns 401 if it does not match.
2. Queries the database for all posts with `status = SCHEDULED` and `scheduledAt <= now`.
3. For each due post, calls the LinkedIn UGC Posts API using the user's stored OAuth access token.
4. Marks successfully published posts as `PUBLISHED` and sets `publishedAt`.
5. Marks any failed posts as `FAILED` and records the reason.
6. Returns a JSON summary of processed posts.

For local testing of the cron endpoint, call it directly:

```bash
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/publish
```

---

## Database Schema

```
User           — synced from Supabase Auth on first login
SocialAccount  — connected LinkedIn (and future) accounts per user
Post           — content, platforms, status, scheduledAt, publishedAt
PostPlatform   — per-platform publish record linking Post → SocialAccount
```

Statuses: `DRAFT` → `SCHEDULED` → `PUBLISHED` or `FAILED`

---

## Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Add all environment variables listed above in Vercel → Project → Settings → Environment Variables.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://your-app.vercel.app`).
5. In your LinkedIn Developer App, add `https://your-app.vercel.app/api/linkedin/callback` as an authorized redirect URI.
6. Deploy. Vercel will automatically run `prisma generate` during the build step (configured in `package.json`).
7. The Cron Job defined in `vercel.json` activates automatically on Vercel's infrastructure.

> Note: Vercel Cron Jobs require a Pro plan or higher for sub-hourly schedules. The `* * * * *` (every minute) schedule used here requires at least a Pro plan.

---

## Coming Soon

- **Twitter / X** — post scheduling and OAuth integration
- **Instagram** — post scheduling via Instagram Graph API

These platforms are visible in the composer UI but are currently disabled (`comingSoon: true`).

---

## Project Structure

```
app/
  api/
    auth/sync-user/     — syncs Supabase user to Prisma DB on first login
    cron/publish/       — cron endpoint that publishes due scheduled posts
    linkedin/
      connect/          — initiates LinkedIn OAuth flow
      callback/         — handles LinkedIn OAuth callback, stores tokens
    posts/              — CRUD endpoints for posts (create, schedule, list, edit, delete)
    social-accounts/    — list and disconnect connected social accounts
  auth/                 — login, register, and error pages
  dashboard/            — main app pages (overview, compose, queue, settings)
components/
  compose/              — PostComposer component
  queue/                — PostQueue and EditPostDialog components
  settings/             — ConnectedAccounts component
lib/
  linkedin.ts           — LinkedIn API helpers (post creation, image upload)
  prisma.ts             — Prisma client singleton
  supabase/             — Supabase client/server helpers
prisma/
  schema.prisma         — database schema
vercel.json             — Vercel Cron configuration
```
