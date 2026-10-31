-- Migration: Sync auth.users to public.users on signup
-- Automatically copies newly created users from Supabase Auth (auth.users)
-- into the application's public.users table so that group memberships,
-- splits, and settlements can reference them immediately.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'New User'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = CASE 
      WHEN public.users.name IS NULL OR public.users.name = 'New User' THEN EXCLUDED.name 
      ELSE public.users.name 
    END,
    avatar = COALESCE(public.users.avatar, EXCLUDED.avatar);

  RETURN NEW;
END;
$$;

-- 2. Drop existing trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
