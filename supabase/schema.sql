-- IronLog schema for Supabase
-- Run this in the SQL Editor of your project (Dashboard → SQL → New query).

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('weights', 'cardio')),
  title text not null,
  performed_on date not null default current_date,
  duration_minutes integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_items (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts on delete cascade,
  exercise_name text not null,
  body_part text check (body_part in ('legs', 'upper_body', 'core')),
  cardio_type text,
  youtube_url text,
  sets integer,
  reps integer,
  weight_kg numeric,
  distance_km numeric,
  duration_minutes integer,
  calories integer,
  intensity text,
  sort_order integer not null default 0
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  category text not null check (category in ('weights', 'cardio', 'habit', 'general')),
  target_value numeric not null,
  current_value numeric not null default 0,
  unit text not null default '',
  deadline date,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  cadence text not null default 'daily' check (cadence in ('daily', 'weekly')),
  target_per_period integer not null default 1,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  logged_on date not null,
  unique (habit_id, logged_on)
);

create index if not exists workouts_user_performed_idx
  on public.workouts (user_id, performed_on desc);

create index if not exists workout_items_workout_idx
  on public.workout_items (workout_id, sort_order);

create index if not exists goals_user_status_idx
  on public.goals (user_id, status);

create index if not exists habits_user_idx
  on public.habits (user_id, archived);

create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, logged_on desc);

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_items enable row level security;
alter table public.goals enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

drop policy if exists "profiles are self" on public.profiles;
create policy "profiles are self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "workouts are self" on public.workouts;
create policy "workouts are self" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "workout items via owner" on public.workout_items;
create policy "workout items via owner" on public.workout_items
  for all using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "goals are self" on public.goals;
create policy "goals are self" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "habits are self" on public.habits;
create policy "habits are self" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "habit logs are self" on public.habit_logs;
create policy "habit logs are self" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
