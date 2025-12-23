-- Ensure secure function for checking admin role exists
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Fix Clients RLS for DELETE
-- Drop potential conflicting policies
drop policy if exists "Only admins can delete clients" on clients;
drop policy if exists "Admins can delete their clients" on clients;

-- Create robust delete policy
create policy "Admins can delete clients"
on clients for delete
using ( public.is_admin() );

-- Fix Intakes RLS for DELETE (usually handled by cascade, but good for safety)
drop policy if exists "Only admins can delete intakes" on intakes;
drop policy if exists "Admins can delete client intakes" on intakes;

create policy "Admins can delete intakes"
on intakes for delete
using ( public.is_admin() );
