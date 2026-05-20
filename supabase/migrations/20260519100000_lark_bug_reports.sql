-- lark_bug_reports table
-- Run this in the Supabase dashboard SQL editor

create table if not exists public.lark_bug_reports (
  id         uuid default gen_random_uuid() primary key,
  message    text not null,
  user_id    uuid references auth.users(id) on delete set null,
  page_url   text,
  created_at timestamptz default now()
);

alter table public.lark_bug_reports enable row level security;

-- Allow anyone (signed in or not) to insert bug reports
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'lark_bug_reports'
    and policyname = 'allow_insert_bug_reports'
  ) then
    create policy "allow_insert_bug_reports"
      on public.lark_bug_reports
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

-- Let authenticated users read their own reports
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'lark_bug_reports'
    and policyname = 'allow_view_own_bug_reports'
  ) then
    create policy "allow_view_own_bug_reports"
      on public.lark_bug_reports
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

notify pgrst, 'reload schema';
