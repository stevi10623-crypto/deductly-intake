-- Add app configuration columns to profiles
alter table profiles 
add column if not exists default_tax_year integer default 2024,
add column if not exists email_notifications boolean default true;
