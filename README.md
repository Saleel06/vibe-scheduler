# Vibe Scheduler

A social media scheduling app built with Next.js, Prisma, and NextAuth. Schedule and manage posts across Twitter, LinkedIn, and Instagram.

## Features

- Compose posts for multiple platforms with per-platform character limits
- Schedule posts for later or publish immediately
- Post queue with status tracking (Draft, Scheduled, Published, Failed)
- LinkedIn OAuth integration for connected accounts
- Draft auto-save to localStorage

## Getting Started

1. Copy the example env file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Push the database schema:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

See `.env.example` for all required variables, including database URL, NextAuth secret, and OAuth credentials for LinkedIn and Google.
