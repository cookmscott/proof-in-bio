BEGIN;

-- 1. DROP TABLES
-- We use CASCADE to automatically handle dependent foreign keys 
-- (e.g., dropping 'collections' will force drop 'collection_photos' if it wasn't dropped first).
-- Order matters slightly for clarity, though CASCADE handles the heavy lifting.

DROP TABLE IF EXISTS collection_photos CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS photo_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE; -- Assumed table name based on 'photo_tags' relationship
DROP TABLE IF EXISTS activities CASCADE;

-- 2. CREATE VIEWS TABLE
-- Creating a table to track views on photos.
-- Uses UUIDs to match your existing schema style.

CREATE TABLE IF NOT EXISTS views (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL, -- Nullable for anonymous views
    ip_address inet, -- Optional: helpful for unique view counting logic
    user_agent text, -- Optional: analytics
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for performance when querying view counts or user history
CREATE INDEX IF NOT EXISTS idx_views_photo_id ON views(photo_id);
CREATE INDEX IF NOT EXISTS idx_views_user_id ON views(user_id);
CREATE INDEX IF NOT EXISTS idx_views_created_at ON views(created_at);

COMMIT;