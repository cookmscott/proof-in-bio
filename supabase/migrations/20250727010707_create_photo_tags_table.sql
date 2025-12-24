-- Create photo_tags junction table
-- This is a many-to-many relationship table that links photos to tags
-- Each row represents one tag applied to one photo
-- This allows multiple tags per photo and the same tag to be used on multiple photos

CREATE TABLE IF NOT EXISTS photo_tags (
  id SERIAL PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES user_profiles(id), -- who added this tag
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes and constraints
CREATE UNIQUE INDEX photo_tags_unique_idx ON photo_tags(photo_id, tag_id);
CREATE INDEX photo_tags_photo_id_idx ON photo_tags(photo_id);
CREATE INDEX photo_tags_tag_id_idx ON photo_tags(tag_id);

-- Function to update tag use_count when photo_tags change
CREATE OR REPLACE FUNCTION update_tag_use_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET use_count = use_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET use_count = use_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to maintain tag use_count
CREATE TRIGGER photo_tags_insert_trigger
  AFTER INSERT ON photo_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_use_count();

CREATE TRIGGER photo_tags_delete_trigger
  AFTER DELETE ON photo_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_use_count();
