-- Create tags table for photo categorization
-- This table stores all available tags (both official platform tags and user-generated tags)
-- Tags are reusable labels that can be applied to multiple photos

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
