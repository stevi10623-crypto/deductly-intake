-- Enable UUIDs
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone
);

-- Clients table
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  firm_admin_id uuid references profiles(id) not null,
  email text not null,
  name text not null,
  status text default 'active' check (status in ('active', 'archived'))
);

-- Intakes table
create table if not exists intakes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references clients(id) on delete cascade not null,
  tax_year integer not null,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'submitted', 'reviewed')),
  token text unique default encode(gen_random_bytes(32), 'hex'),
  data jsonb default '{}'::jsonb
);

-- RLS Policies
alter table profiles enable row level security;
alter table clients enable row level security;
alter table intakes enable row level security;

-- Profiles: Users can see their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Clients: Firm admins can view/create clients
create policy "Admins can view their clients" on clients for select using (auth.uid() = firm_admin_id);
create policy "Admins can insert their clients" on clients for insert with check (auth.uid() = firm_admin_id);

-- Intakes: Firm admins can view their clients' intakes
create policy "Admins can view client intakes" on intakes for select using (
  exists (
    select 1 from clients where clients.id = intakes.client_id and clients.firm_admin_id = auth.uid()
  )
);

-- RPC Function for secure client access via token
create or replace function get_intake_by_token(lookup_token text)
returns setof intakes
language sql
security definer
as $$
  select * from intakes where token = lookup_token;
$$;

create or replace function update_intake_data(lookup_token text, new_data jsonb)
returns boolean
language plpgsql
security definer
as $$
begin
  update intakes 
  set data = new_data, updated_at = now(), status = 'in_progress'
  where token = lookup_token;
  
  return found;
end;
$$;
