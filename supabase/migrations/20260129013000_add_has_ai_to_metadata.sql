BEGIN;

-- Add has_ai flag to photos_metadata
-- Nullable like has_alpha; defaults to false for existing + future rows unless explicitly set.
ALTER TABLE public.photos_metadata
  ADD COLUMN IF NOT EXISTS has_ai boolean NOT NULL DEFAULT false;

-- (Optional but recommended) index if you’ll filter on it often (e.g., has_ai = true)
CREATE INDEX IF NOT EXISTS photos_metadata_has_ai_idx
  ON public.photos_metadata USING btree (has_ai);

COMMIT;