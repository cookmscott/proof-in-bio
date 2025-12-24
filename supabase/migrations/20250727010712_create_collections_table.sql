-- Create collections table for user-created photo albums
-- Collections allow users to organize photos into curated groups/albums (like "Best of 2024", "NYC Street", etc.)
-- Each collection has a slug for pretty URLs (e.g., /user/collections/nyc-street)

CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL,
  cover_photo_id UUID REFERENCES photos(id),
  is_public BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes and constraints
CREATE UNIQUE INDEX collections_user_slug_idx ON collections(user_id, slug);
CREATE INDEX collections_user_id_idx ON collections(user_id);
CREATE INDEX collections_is_public_idx ON collections(is_public);

-- Create trigger for collections updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
