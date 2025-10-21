-- Create comments table for photo discussions
-- This table stores user comments on photos with support for threaded replies
-- parent_id allows nested comment threads (replies to comments)

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
