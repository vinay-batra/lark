create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now()
);

alter table waitlist enable row level security;

create policy "Anyone can join waitlist"
  on waitlist for insert
  to anon, authenticated
  with check (true);
