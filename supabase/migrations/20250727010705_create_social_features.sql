-- Create social features: likes, comments, and follows
-- These tables enable user engagement and community features

-- Likes table for photo engagement
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

-- Comments table for photo discussions
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments(id), -- for threaded comments
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX comments_photo_id_idx ON comments(photo_id);
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_parent_id_idx ON comments(parent_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);

-- Add constraint to prevent empty content
ALTER TABLE comments ADD CONSTRAINT comments_content_not_empty CHECK (LENGTH(TRIM(content)) > 0);

-- Follows table for user relationships
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

-- Create trigger for comments updated_at
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set is_edited flag when content changes
CREATE OR REPLACE FUNCTION mark_comment_as_edited()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content != NEW.content THEN
    NEW.is_edited = TRUE;
    NEW.edited_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to mark comments as edited
CREATE TRIGGER mark_comment_edited_trigger
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION mark_comment_as_edited();