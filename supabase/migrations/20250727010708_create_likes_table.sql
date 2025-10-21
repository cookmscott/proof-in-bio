-- Create likes table for photo engagement
-- This table tracks which users have liked which photos
-- Each row represents one user liking one photo

CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes and constraints
CREATE UNIQUE INDEX likes_user_photo_idx ON likes(user_id, photo_id);
CREATE INDEX likes_photo_id_idx ON likes(photo_id);
CREATE INDEX likes_user_id_idx ON likes(user_id);
CREATE INDEX likes_created_at_idx ON likes(created_at DESC);
