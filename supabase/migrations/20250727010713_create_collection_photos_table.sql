-- Create collection_photos junction table
-- This is a many-to-many relationship linking collections to photos
-- One collection can contain many photos, and one photo can be in many collections
-- sort_order allows users to arrange photos within a collection

CREATE TABLE IF NOT EXISTS collection_photos (
  id SERIAL PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes and constraints
CREATE UNIQUE INDEX collection_photos_unique_idx ON collection_photos(collection_id, photo_id);
CREATE INDEX collection_photos_collection_id_idx ON collection_photos(collection_id);
CREATE INDEX collection_photos_photo_id_idx ON collection_photos(photo_id);
