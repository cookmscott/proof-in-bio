-- Create follows table for user relationships
-- This table tracks which users follow which other users
-- follower_id is the user doing the following
-- following_id is the user being followed

CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes and constraints
CREATE UNIQUE INDEX follows_unique_idx ON follows(follower_id, following_id);
CREATE INDEX follows_follower_idx ON follows(follower_id);
CREATE INDEX follows_following_idx ON follows(following_id);

-- Prevent users from following themselves
ALTER TABLE follows ADD CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id);
