-- Bug reports (anonymous + authenticated)
create table if not exists lark_bug_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  page_url text,
  created_at timestamptz default now()
);
alter table lark_bug_reports enable row level security;
create policy "Anyone can submit bug reports"
  on lark_bug_reports for insert to anon, authenticated with check (true);

-- Practice sessions
create table if not exists lark_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  artist text not null,
  accuracy int not null,
  hits int not null,
  total int not null,
  completed_at timestamptz default now()
);
alter table lark_sessions enable row level security;
create policy "Users manage own sessions"
  on lark_sessions for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Saved songs
create table if not exists lark_saved_songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text not null,
  custom_name text,
  notes_json jsonb not null,
  generated boolean default false,
  saved_at timestamptz default now()
);
alter table lark_saved_songs enable row level security;
create policy "Users manage own saved songs"
  on lark_saved_songs for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI generation history (for rate limiting per account)
create table if not exists lark_gen_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz default now()
);
alter table lark_gen_history enable row level security;
create policy "Users manage own gen history"
  on lark_gen_history for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
