-- 1. Create Invitations table
create table if not exists invites (
  email text primary key,
  full_name text,
  role text default 'office' check (role in ('admin', 'office')),
  created_at timestamp with time zone default now()
);

-- Enable RLS on invites
alter table invites enable row level security;
create policy "Admins manage invites" on invites for all using (is_admin());

-- 2. Update trigger to look for invites
create or replace function public.handle_new_user()
returns trigger as $$
declare
  invite_record record;
begin
  -- Check if there is an invite for this email
  select * from public.invites where email = new.email into invite_record;
  
  insert into public.profiles (id, email, full_name, role, updated_at)
  values (
    new.id,
    new.email,
    coalesce(invite_record.full_name, new.raw_user_meta_data->>'full_name', 'Unnamed Staff'),
    coalesce(invite_record.role, case when new.email = 'rebecca@jvbackllc.com' then 'admin' else 'office' end),
    now()
  );
  
  -- Clean up invite if it exists
  if invite_record.email is not null then
    delete from public.invites where email = new.email;
  end if;

  return new;
end;
$$ language plpgsql security definer;
