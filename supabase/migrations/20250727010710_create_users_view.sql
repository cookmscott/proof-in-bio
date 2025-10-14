-- Supabase Auth is trying to access a public.users table
-- Create a simple table to satisfy the auth service
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'authenticated',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant all permissions to auth admin
GRANT ALL ON users TO supabase_auth_admin;
GRANT ALL ON users TO postgres;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- No RLS on this table - let auth service manage it freely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Update trigger to also populate this table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  
  RAISE LOG 'Creating user records for user_id: %', NEW.id;

  -- Create minimal users record for auth service
  INSERT INTO public.users (id, role, updated_at)
  VALUES (NEW.id, 'authenticated', NOW())
  ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

  -- Create user_profiles record for our app
  INSERT INTO public.user_profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );

  RAISE LOG 'Successfully created user records for user_id: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user records: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
