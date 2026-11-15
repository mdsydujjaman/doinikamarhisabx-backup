create table if not exists pin_security (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, pin_hash text not null, phone text, email text,
  updated_at timestamptz default now()
);
create table if not exists backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, file_name text, created_at timestamptz default now()
);
alter table pin_security enable row level security;
alter table backups enable row level security;
create policy "public all pin" on pin_security for all using (true) with check (true);
create policy "public all backups" on backups for all using (true) with check (true);
