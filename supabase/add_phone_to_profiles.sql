-- Add phone column to profiles table
alter table profiles 
add column if not exists phone text;
