-- Create tags system for photo categorization
-- Supports both official platform tags and user-generated tags

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- hex color code for UI
  is_official BOOLEAN DEFAULT FALSE, -- system vs user tags
  use_count INTEGER DEFAULT 0, -- denormalized for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE UNIQUE INDEX tags_name_idx ON tags(name);
CREATE UNIQUE INDEX tags_slug_idx ON tags(slug);
CREATE INDEX tags_use_count_idx ON tags(use_count DESC);

-- Create photo_tags junction table
CREATE TABLE IF NOT EXISTS photo_tags (
  id SERIAL PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES users(id), -- who added this tag
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

-- Insert some default official tags
INSERT INTO tags (name, slug, description, color, is_official) VALUES
  ('Photography', 'photography', 'General photography', '#3B82F6', TRUE),
  ('Portrait', 'portrait', 'Portrait photography', '#EF4444', TRUE),
  ('Landscape', 'landscape', 'Landscape photography', '#10B981', TRUE),
  ('Street', 'street', 'Street photography', '#F59E0B', TRUE),
  ('Nature', 'nature', 'Nature photography', '#059669', TRUE),
  ('Architecture', 'architecture', 'Architectural photography', '#6366F1', TRUE),
  ('Travel', 'travel', 'Travel photography', '#EC4899', TRUE),
  ('Wildlife', 'wildlife', 'Wildlife photography', '#84CC16', TRUE)
ON CONFLICT (name) DO NOTHING;