-- Allow users to insert their own profile (required for upsert if row is missing)
create policy "Users can insert own profile"
on profiles for insert
with check (auth.uid() = id);
