-- Song request submissions from users
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/ebsddbpbvjbcdwfldubx/sql

create table if not exists lark_song_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete set null,
  song_title  text not null,
  artist      text not null,
  message     text,
  created_at  timestamptz not null default now()
);

-- Only admins (service role) can read all requests; users can insert their own
alter table lark_song_requests enable row level security;

create policy "Anyone can insert song requests"
  on lark_song_requests for insert
  with check (true);

create policy "Users can view their own requests"
  on lark_song_requests for select
  using (auth.uid() = user_id);

-- Index for admin review
create index lark_song_requests_created_at on lark_song_requests (created_at desc);
