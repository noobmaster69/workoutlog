# IronLog

A React workout logger for **weights** and **cardio**, with accounts, goal setting, habit tracking, and a YouTube form video on every exercise.

**Live:** [workoutlog-seven.vercel.app](https://workoutlog-seven.vercel.app)

The public homepage is a marketing landing page meant for [Vercel](https://vercel.com). Signed-in users log sessions against [Supabase](https://supabase.com) (Auth + Postgres). If Supabase env vars are missing, the app still runs in a local demo mode using the browser.

## Features

- **Accounts** — email and password sign up / sign in
- **Weights** — split by **legs**, **upper body**, and **core**; sets, reps, and load
- **Cardio** — type (run, bike, swim, row, HIIT, …), distance, time, calories, intensity
- **YouTube** — catalog movements ship with a form clip or search link; you can paste your own URL
- **Goals** — numeric targets with progress
- **Habits** — daily or weekly check-ins, 14-day grid, streaks

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You can skip `.env.local` to try the app with local demo accounts.

```bash
npm test
npm run build
```

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql). That creates tables, Row Level Security, and a trigger that inserts a `profiles` row on signup.
3. In **Authentication → Providers**, keep Email enabled. For easier local testing you can turn off “Confirm email”.
4. Copy **Project URL** and the **anon** / **publishable** key from **Project Settings → API**.

`.env.local`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

`VITE_SUPABASE_PUBLISHABLE_KEY` is also accepted if you prefer the newer key name.

These values are safe to expose in the Vite bundle. Access is enforced by RLS: users only see their own workouts, goals, and habits.

## Deploy on Vercel

The repo is already linked to a Vercel project, so pushes to `master` deploy to
production and pushes to any other branch get a preview URL. Nothing to run by hand.

To point a fresh Vercel project at this repo instead:

1. In Vercel: **Add New → Project** and import the repo. Framework preset: **Vite**.
2. Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
3. Deploy. Vercel serves `dist/`, and `vercel.json` rewrites unknown paths to
   `index.html` so React Router works.

`vercel.json` also caches hashed files under `/assets/` for a year as immutable and
sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and
`Permissions-Policy` on every response.

Without the Supabase variables the deployment still runs, in browser-local demo mode.

In the [Supabase Auth URL config](https://supabase.com/dashboard/project/_/auth/url-configuration), add your Vercel domain (and `http://localhost:5173` for local) to **Site URL** and **Redirect URLs**.

## App routes

| Path | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login` | Create account / sign in |
| `/app` | Dashboard |
| `/app/log` | Log weights or cardio |
| `/app/history` | Past sessions + videos |
| `/app/library` | Exercise catalog with YouTube |
| `/app/goals` | Goal setting |
| `/app/habits` | Habit tracking |
