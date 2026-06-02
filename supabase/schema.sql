-- ============================================
-- ConvictionOS Database Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  username text unique,
  trader_style text check (trader_style in ('scalper', 'swing', 'degen', 'momentum')),
  whop_user_id text unique,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================
-- TRADES TABLE
-- ============================================
create table if not exists public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  ticker text not null,
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric(20, 8),
  exit_price numeric(20, 8),
  result_pct numeric(10, 4) not null,
  pnl_usd numeric(20, 2),
  conviction_level integer not null check (conviction_level between 1 and 5),
  emotional_state text not null check (emotional_state in ('calm', 'fomo', 'revenge', 'confident', 'uncertain', 'greedy')),
  setup_tag text,
  exit_reason text not null check (exit_reason in ('target_hit', 'stop_hit', 'panic', 'early', 'late', 'held_too_long')),
  notes text,
  trade_date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.trades enable row level security;

create policy "Users can view own trades"
  on public.trades for select
  using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on public.trades for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trades for update
  using (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trades for delete
  using (auth.uid() = user_id);

-- ============================================
-- WEEKLY REPORTS TABLE
-- ============================================
create table if not exists public.weekly_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  week_start date not null,
  conviction_score integer not null check (conviction_score between 0 and 100),
  top_pattern text not null,
  bottom_pattern text not null,
  trade_count integer not null,
  win_rate numeric(5, 2) not null,
  avg_conviction numeric(5, 2) not null,
  report_json jsonb not null default '{}',
  created_at timestamptz default now(),
  unique(user_id, week_start)
);

alter table public.weekly_reports enable row level security;

create policy "Users can view own reports"
  on public.weekly_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on public.weekly_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reports"
  on public.weekly_reports for update
  using (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists trades_user_id_idx on public.trades(user_id);
create index if not exists trades_trade_date_idx on public.trades(trade_date);
create index if not exists trades_user_date_idx on public.trades(user_id, trade_date desc);
create index if not exists weekly_reports_user_id_idx on public.weekly_reports(user_id);

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
