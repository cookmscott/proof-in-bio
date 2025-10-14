-- Create photos table for storing photo metadata and C2PA verification data
-- This is the core table for the platform's photo verification system

CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  title VARCHAR(200),
  description TEXT,
  
  -- File metadata
  file_size INTEGER NOT NULL, -- bytes
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  
  -- Storage paths
  storage_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  
  -- C2PA verification data
  c2pa_manifest JSONB, -- Complete C2PA manifest
  c2pa_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- verified, failed, pending
  c2pa_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- EXIF data
  exif_data JSONB, -- Raw EXIF data as JSON
  camera VARCHAR(100),
  lens VARCHAR(100),
  focal_length VARCHAR(20),
  aperture VARCHAR(20),
  shutter_speed VARCHAR(20),
  iso INTEGER,
  captured_at TIMESTAMP WITH TIME ZONE, -- from EXIF
  
  -- Visibility and status
  is_public BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX photos_user_id_idx ON photos(user_id);
CREATE INDEX photos_c2pa_status_idx ON photos(c2pa_status);
CREATE INDEX photos_is_public_idx ON photos(is_public);
CREATE INDEX photos_created_at_idx ON photos(created_at DESC);
CREATE INDEX photos_captured_at_idx ON photos(captured_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();