-- Create user_profiles table to extend auth.users with profile information
-- This table stores additional user profile data beyond Supabase auth

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  website VARCHAR(255),
  location VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Ensure username is kebab-case: lowercase alphanumeric with hyphens, min 3 chars
  CONSTRAINT username_format_check CHECK (
    username ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' AND LENGTH(username) >= 3
  )
);

-- Create indexes for performance
CREATE UNIQUE INDEX user_profiles_username_idx ON user_profiles(username);
CREATE UNIQUE INDEX user_profiles_email_idx ON user_profiles(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles table
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
