BEGIN;

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS storage_key text,
  ADD COLUMN IF NOT EXISTS file_ext text;

COMMIT;
