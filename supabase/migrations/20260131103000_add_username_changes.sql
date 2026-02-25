BEGIN;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS username_changes integer NOT NULL DEFAULT 0;

COMMIT;
