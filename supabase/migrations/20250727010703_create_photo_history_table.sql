-- Create photo_history table for tracking C2PA provenance chain
-- This table stores every edit/action performed on a photo for authenticity verification

CREATE TABLE IF NOT EXISTS photo_history (
  id SERIAL PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'upload', 'crop', 'adjust', 'filter', etc.
  action_description VARCHAR(200),
  
  -- Edit metadata
  software VARCHAR(100), -- Lightroom, Photoshop, etc.
  software_version VARCHAR(50),
  parameters JSONB, -- Edit parameters as JSON
  
  -- C2PA data for this specific edit
  c2pa_assertion JSONB, -- C2PA assertion for this edit step
  
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX photo_history_photo_id_idx ON photo_history(photo_id);
CREATE INDEX photo_history_action_type_idx ON photo_history(action_type);
CREATE INDEX photo_history_performed_at_idx ON photo_history(performed_at DESC);

-- Add constraint to ensure performed_at is not in the future
ALTER TABLE photo_history 
ADD CONSTRAINT photo_history_performed_at_check 
CHECK (performed_at <= NOW());