-- Create photos_metadata table for detailed metadata
-- This table is loaded on-demand when viewing individual photos

CREATE TABLE IF NOT EXISTS photos_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- File metadata
  file_size INTEGER NOT NULL, -- bytes
  mime_type VARCHAR(100) NOT NULL,

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

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX photos_metadata_photo_id_idx ON photos_metadata(photo_id);
CREATE INDEX photos_metadata_c2pa_status_idx ON photos_metadata(c2pa_status);
CREATE INDEX photos_metadata_captured_at_idx ON photos_metadata(captured_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_photos_metadata_updated_at BEFORE UPDATE ON photos_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
