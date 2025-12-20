-- Create a new private bucket 'intake-documents' ONLY if it doesn't match
insert into storage.buckets (id, name, public)
values ('intake-documents', 'intake-documents', true)
on conflict (id) do nothing; -- Skip if bucket already exists

-- Drop existing policies to avoid conflicts if re-running
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Uploads" on storage.objects;
drop policy if exists "Authenticated Deletes" on storage.objects;

-- Allow public access to read files (so admin dashboard can view them)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'intake-documents' );

-- Allow authenticated uploads
create policy "Authenticated Uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'intake-documents' );

-- Allow deletions
create policy "Authenticated Deletes"
on storage.objects for delete
to authenticated
using ( bucket_id = 'intake-documents' );
