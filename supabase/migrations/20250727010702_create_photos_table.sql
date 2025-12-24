-- Create photos table for core photo information
-- This table contains minimal data for fast portfolio browsing

CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200),
  description TEXT,

  -- Storage paths
  storage_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),

  -- Basic display info
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,

  -- Visibility and status
  is_public BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX photos_user_id_idx ON photos(user_id);
CREATE INDEX photos_is_public_idx ON photos(is_public);
CREATE INDEX photos_created_at_idx ON photos(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();