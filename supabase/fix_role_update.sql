-- Fix Role Update Policy for Admin Users
-- Run this in Supabase SQL Editor if "Change Role" is not working

-- 1. First, drop any conflicting policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view and update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Recreate the is_admin function (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create separate, non-conflicting policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING ( auth.uid() = id );

-- Users can update their own profile (for settings like password, name)
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING ( public.is_admin() );

-- Admins can UPDATE all profiles (important for role changes)
CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING ( public.is_admin() );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" 
ON profiles FOR DELETE 
USING ( public.is_admin() );

-- 4. Grant execute on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
