# ConvictionOS

Trading performance system for serious traders. Built with Next.js + Supabase + Claude AI.

## Stack
- **Next.js 15** (App Router)
- **Supabase** (Auth + Postgres)
- **Anthropic Claude** (Weekly insight reports)
- **Vercel** (Hosting)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variables
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
cp .env.example .env.local
```

Required:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
- `ANTHROPIC_API_KEY` — your Anthropic API key
- `WHOP_API_KEY` — your Whop API key
- `NEXT_PUBLIC_WHOP_APP_ID` — your Whop app ID

### 3. Set up database
Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
# Push to GitHub first, then:
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Add all env variables from .env.local
# 4. Deploy
```

## Routes
- `/` — Redirects to dashboard or login
- `/login` — Auth page (sign in / sign up)
- `/onboard` — First-time setup (username + trader style)
- `/dashboard` — Main view (score, trades, stats)
- `/log` — Log a trade (60 second flow)
- `/report` — Weekly Conviction Report (AI-generated)
- `/api/report` — POST endpoint to generate report

## Database
See `supabase/schema.sql` for full schema. 3 tables:
- `users` — profiles
- `trades` — individual trade logs
- `weekly_reports` — AI-generated weekly reports
