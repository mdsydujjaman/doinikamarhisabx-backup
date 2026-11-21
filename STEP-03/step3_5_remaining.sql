-- STEP-03 FILE-5 : Remaining 12 Tables + Ledger Rules
-- NUMERIC(18,2) everywhere, id/user_id/created_at/updated_at everywhere

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, phone text, email text, name text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, name text not null, type text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists persons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, name text not null,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, transaction_id uuid, account_id uuid,
  amount numeric(18,2) not null default 0,
  side text, note text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, person_id uuid, title text, amount numeric(18,2) default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, transaction_id uuid, file_name text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, title text, remind_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists referral_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, points numeric(18,2) default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, points numeric(18,2) default 0, note text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, plan text, amount numeric(18,2) default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists complaints_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, message text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, action text, detail text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists system_translations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, key text, value text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, net_worth numeric(18,2) default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
-- transactions: operation_id UNIQUE (Duplicate রোধ)
alter table transactions add column if not exists operation_id text;
create unique index if not exists idx_tx_operation_id on transactions(operation_id) where operation_id is not null;
-- RLS ON সব Table-এ
alter table users enable row level security;
alter table categories enable row level security;
alter table persons enable row level security;
alter table ledger_entries enable row level security;
alter table agreements enable row level security;
alter table receipts enable row level security;
alter table reminders enable row level security;
alter table referral_points enable row level security;
alter table point_ledger enable row level security;
alter table subscriptions enable row level security;
alter table complaints_suggestions enable row level security;
alter table audit_logs enable row level security;
alter table system_translations enable row level security;
alter table net_worth_snapshots enable row level security;
