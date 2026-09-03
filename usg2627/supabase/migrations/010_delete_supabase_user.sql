-- Migration 010: Postgres RPC function to automatically delete user accounts from auth.users & public.user_profiles
CREATE OR REPLACE FUNCTION public.delete_supabase_user(target_email TEXT DEFAULT NULL, target_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- 1. Permanently delete user from Supabase Auth (auth.users)
  DELETE FROM auth.users
  WHERE (
    (target_email IS NOT NULL AND LOWER(email) = LOWER(target_email)) 
    OR (target_user_id IS NOT NULL AND id = target_user_id)
  );

  -- 2. Delete user profile record from public.user_profiles
  DELETE FROM public.user_profiles
  WHERE (
    (target_email IS NOT NULL AND LOWER(email) = LOWER(target_email)) 
    OR (target_user_id IS NOT NULL AND (user_id = target_user_id OR id = target_user_id))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
