-- Fix Profile RLS Policies to allow members to see themselves and admins to see everyone
-- This avoids the "Cannot coerce result to single JSON object" error caused by RLS blocking visibility

-- 1. Create a security definer function to check roles without recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop existing restrictive/broken policies
drop policy if exists "Admins can view and update all profiles" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- 3. Users can view and update their OWN profile (Crucial for Settings page)
create policy "Users can view own profile" 
on profiles for select 
using ( auth.uid() = id );

create policy "Users can update own profile" 
on profiles for update 
using ( auth.uid() = id );

-- 4. Admins can view and update EVERYTHING
create policy "Admins can manage all profiles" 
on profiles for all 
using ( public.is_admin() );

-- 5. Fix Clients/Intakes delete policies to use the new function (non-recursive)
drop policy if exists "Only admins can delete clients" on clients;
create policy "Only admins can delete clients" on clients for delete using ( public.is_admin() );

drop policy if exists "Only admins can delete intakes" on intakes;
create policy "Only admins can delete intakes" on intakes for delete using ( public.is_admin() );
