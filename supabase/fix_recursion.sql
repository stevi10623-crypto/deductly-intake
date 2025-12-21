-- 1. Create a helper function to check admin status without recursion
-- This function is 'security definer' so it bypasses RLS
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

-- 2. Clean up old policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can view and update all profiles" on profiles;
drop policy if exists "Manage own profile" on profiles;
drop policy if exists "Admins manage all" on profiles;

-- 3. Create fresh, non-recursive policies
-- Every user can manage their own profile
create policy "Manage own profile" 
on profiles for all 
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admins can manage everything
create policy "Admins manage all" 
on profiles for all 
using (is_admin());

-- 4. Update the 'Only admins can delete' policies to use the function for consistency
drop policy if exists "Only admins can delete clients" on clients;
create policy "Only admins can delete clients" on clients for delete using (is_admin());

drop policy if exists "Only admins can delete intakes" on intakes;
create policy "Only admins can delete intakes" on intakes for delete using (is_admin());
