-- LinguaForge Production PostgreSQL Schema (Supabase Ready)
-- Run this SQL in Supabase SQL Editor when migrating from localStorage to Cloud Sync.

create extension if not exists "pgcrypto";

-- 1. Learner Profiles (linked 1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  active_target_lang text not null default 'en',
  chinese_script text not null default 'simplified',
  show_phonetics boolean not null default true,
  daily_goal_cards int not null default 10,
  streak_days int not null default 0,
  streak_freezes int not null default 1,
  reviewed_today int not null default 0,
  last_study_date date,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'classroom')),
  role text not null default 'learner' check (role in ('learner', 'teacher', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. User SRS Vocabulary Progress (Indexed for fast Daily Due Review queries)
create table if not exists public.user_vocab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null,
  language_code text not null,
  topic_id text not null,
  day_number int not null default 1,
  is_completed_in_topic boolean not null default false,
  srs_state text not null default 'new' check (srs_state in ('new', 'learning', 'review', 'mastered')),
  interval_days int not null default 0,
  ease_factor numeric(4,2) not null default 2.50,
  repetitions int not null default 0,
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  personal_notes text,
  unique (user_id, card_id)
);

create index if not exists idx_vocab_due_queue
  on public.user_vocab_progress (user_id, language_code, next_review_at)
  where is_completed_in_topic = true;

-- 3. Topic & Day Unlock Progress
create table if not exists public.user_topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language_code text not null,
  topic_id text not null,
  unlocked_day int not null default 1,
  active_day int not null default 1,
  completed_days int[] not null default '{}',
  gate_test_passed_days int[] not null default '{1}',
  current_card_index int not null default 0,
  is_completed boolean not null default false,
  last_studied_at timestamptz not null default now(),
  unique (user_id, language_code, topic_id)
);

-- 4. AI Roleplay Chat History & Quota Tracking
create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language_code text not null,
  scenario_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  phonetic text,
  translation_vi text,
  grammar_analysis jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_chat_lookup
  on public.ai_chat_messages (user_id, language_code, scenario_id, created_at desc);

-- 5. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_vocab_progress enable row level security;
alter table public.user_topic_progress enable row level security;
alter table public.ai_chat_messages enable row level security;

create policy "Users manage own profile"
  on public.profiles for all using (auth.uid() = id);

create policy "Users manage own vocab progress"
  on public.user_vocab_progress for all using (auth.uid() = user_id);

create policy "Users manage own topic progress"
  on public.user_topic_progress for all using (auth.uid() = user_id);

create policy "Users manage own AI chats"
  on public.ai_chat_messages for all using (auth.uid() = user_id);
