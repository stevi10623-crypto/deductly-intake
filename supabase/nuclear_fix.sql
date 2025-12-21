-- 1. Create safe helper function (security definer bypasses RLS)
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 2. NUCLEAR CLEANUP - Drop every possible policy name we've used
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can view and update all profiles" on profiles;
drop policy if exists "Manage own profile" on profiles;
drop policy if exists "Admins manage all" on profiles;
drop policy if exists "Team can view all profiles" on profiles;

-- 3. RESET RLS
alter table profiles disable row level security;
alter table profiles enable row level security;

-- 4. CLEAN POLICIES (No recursion)
-- Anyone logged in can see and edit their own row
create policy "Profiles_OWNER" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Admins can do everything to any row (Safe because it uses the function)
create policy "Profiles_ADMIN" on profiles for all using (is_admin());

-- 5. CLIENTS/INTAKES CLEANUP
drop policy if exists "Admins can view their clients" on clients;
drop policy if exists "Admins can insert their clients" on clients;
drop policy if exists "Teams can view all clients" on clients;
drop policy if exists "Team can view all clients" on clients;
drop policy if exists "Only admins can delete clients" on clients;

create policy "Clients_VIEW_ALL" on clients for select using (true);
create policy "Clients_INSERT_ALL" on clients for insert with check (true);
create policy "Clients_DELETE_ADMIN" on clients for delete using (is_admin());

drop policy if exists "Admins can view client intakes" on intakes;
drop policy if exists "Team can view all intakes" on intakes;
drop policy if exists "Only admins can delete intakes" on intakes;

create policy "Intakes_VIEW_ALL" on intakes for select using (true);
create policy "Intakes_UPDATE_ALL" on intakes for update using (true);
create policy "Intakes_DELETE_ADMIN" on intakes for delete using (is_admin());
