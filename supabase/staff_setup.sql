-- 1. Create a trigger function to automatically create a profile for new signups
-- This ensures 'Office Staff' get their profile as soon as they sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'office' -- Every new signup starts as Office Staff
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created in Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Storage Security: Ensure staff can see all files, but only Admins can delete
-- Enable RLS on storage (objects table)
-- Note: 'intake-documents' bucket must exist

-- Anyone (staff/client) can upload
drop policy if exists "Anyone can upload intake documents" on storage.objects;
create policy "Anyone can upload intake documents"
on storage.objects for insert
with check (bucket_id = 'intake-documents');

-- All staff (authenticated users with a profile) can view ALL documents
drop policy if exists "Staff can view all documents" on storage.objects;
create policy "Staff can view all documents"
on storage.objects for select
using (
  bucket_id = 'intake-documents' 
  and auth.role() = 'authenticated'
);

-- ONLY Admins can delete documents
drop policy if exists "Only admins can delete documents" on storage.objects;
create policy "Only admins can delete documents"
on storage.objects for delete
using (
  bucket_id = 'intake-documents' 
  and is_admin() -- Uses the helper function we created earlier
);
