-- Update trigger to handle pre-registered profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Unnamed Staff'),
    case 
      when new.email = 'rebecca@jvbackllc.com' then 'admin'
      else 'office'
    end
  )
  on conflict (id) do update 
  set 
    email = excluded.email,
    full_name = coalesce(profiles.full_name, excluded.full_name);
    
  -- Also handle the case where we pre-registered by email but didn't have the ID yet
  update public.profiles 
  set id = new.id, full_name = coalesce(full_name, new.raw_user_meta_data->>'full_name')
  where email = new.email and id is null;

  return new;
end;
$$ language plpgsql security definer;
