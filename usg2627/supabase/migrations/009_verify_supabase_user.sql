-- Migration 009: Postgres RPC functions to verify / unverify accounts in auth.users & public.user_profiles

CREATE OR REPLACE FUNCTION public.verify_supabase_user(target_email TEXT, target_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- 1. Confirm email & account in Supabase Auth (auth.users)
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
  WHERE (email = LOWER(target_email) OR (target_user_id IS NOT NULL AND id = target_user_id));

  -- 2. Update is_verified in public.user_profiles
  UPDATE public.user_profiles
  SET 
    is_verified = TRUE,
    updated_at = NOW()
  WHERE (LOWER(email) = LOWER(target_email) OR (target_user_id IS NOT NULL AND (user_id = target_user_id OR id = target_user_id)));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.unverify_supabase_user(target_email TEXT, target_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- 1. Set email_confirmed_at to NULL in Supabase Auth (auth.users)
  UPDATE auth.users
  SET 
    email_confirmed_at = NULL,
    confirmed_at = NULL
  WHERE (email = LOWER(target_email) OR (target_user_id IS NOT NULL AND id = target_user_id));

  -- 2. Update is_verified to FALSE in public.user_profiles
  UPDATE public.user_profiles
  SET 
    is_verified = FALSE,
    updated_at = NOW()
  WHERE (LOWER(email) = LOWER(target_email) OR (target_user_id IS NOT NULL AND (user_id = target_user_id OR id = target_user_id)));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
