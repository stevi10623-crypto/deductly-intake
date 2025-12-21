-- Add role column to profiles
alter table profiles add column if not exists role text default 'office' check (role in ('admin', 'office'));

-- Update RLS Policies for shared access

-- Profiles
drop policy if exists "Admins can view and update all profiles" on profiles;
create policy "Admins can view and update all profiles" 
on profiles for all 
using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- Clients
drop policy if exists "Admins can view their clients" on clients;
drop policy if exists "Admins can insert their clients" on clients;
drop policy if exists "Admins can delete their clients" on clients;

create policy "Team can view all clients" on clients for select using (true);
create policy "Team can insert clients" on clients for insert with check (true);
create policy "Only admins can delete clients" on clients for delete using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- Intakes
drop policy if exists "Admins can view client intakes" on intakes;
create policy "Team can view all intakes" on intakes for select using (true);
create policy "Team can update intakes" on intakes for update using (true);
create policy "Only admins can delete intakes" on intakes for delete using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
