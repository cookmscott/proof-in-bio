-- Create photo_history table for tracking C2PA provenance chain
-- This table stores every edit/action performed on a photo for authenticity verification
-- The c2pa_assertion JSONB contains all edit details (action, software, parameters, etc.)
-- performed_at is extracted from the C2PA assertion for fast indexed sorting

CREATE TABLE IF NOT EXISTS photo_history (
  id SERIAL PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,

  -- C2PA data for this specific edit
  c2pa_assertion JSONB NOT NULL, -- Complete C2PA assertion for this edit step

  -- Extracted timestamp for fast sorting (pulled from c2pa_assertion)
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX photo_history_photo_id_idx ON photo_history(photo_id);
CREATE INDEX photo_history_performed_at_idx ON photo_history(performed_at DESC);

-- Add constraint to ensure performed_at is not in the future
ALTER TABLE photo_history
ADD CONSTRAINT photo_history_performed_at_check
CHECK (performed_at <= NOW());