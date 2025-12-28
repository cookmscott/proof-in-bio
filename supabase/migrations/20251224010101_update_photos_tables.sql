BEGIN;

-- =========================================================
-- 1) PHOTOS: add app/query-hot columns (idempotent)
-- =========================================================
ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',     -- public|unlisted|followers|private
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing',     -- processing|ready|failed|deleted
  ADD COLUMN IF NOT EXISTS taken_at timestamptz NULL,                    -- canonical sort date (usually from EXIF)
  ADD COLUMN IF NOT EXISTS published_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS blurhash text NULL,
  ADD COLUMN IF NOT EXISTS storage_key text NULL,
  ADD COLUMN IF NOT EXISTS thumbnail_key text NULL;

-- FIX: Use DO block because 'ADD CONSTRAINT IF NOT EXISTS' is invalid syntax
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'photos_visibility_check') THEN
    ALTER TABLE public.photos
      ADD CONSTRAINT photos_visibility_check
      CHECK (visibility IN ('public','unlisted','followers','private'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'photos_status_check') THEN
    ALTER TABLE public.photos
      ADD CONSTRAINT photos_status_check
      CHECK (status IN ('processing','ready','failed','deleted'));
  END IF;
END $$;

-- Optional backfills
-- Note: Since you added visibility with DEFAULT 'public', new columns are already populated. 
-- This only affects rows if the column existed previously with NULLs.
UPDATE public.photos
SET visibility = CASE WHEN is_public IS TRUE THEN 'public' ELSE 'private' END
WHERE visibility IS NULL AND (is_public IS NOT NULL); -- Safe check if is_public exists

UPDATE public.photos p
SET taken_at = pm.captured_at
FROM public.photos_metadata pm
WHERE pm.photo_id = p.id
  AND p.taken_at IS NULL
  AND pm.captured_at IS NOT NULL;

UPDATE public.photos p
SET like_count = x.cnt
FROM (
  SELECT photo_id, COUNT(*)::int AS cnt
  FROM public.likes
  GROUP BY photo_id
) x
WHERE x.photo_id = p.id;

UPDATE public.photos p
SET comment_count = x.cnt
FROM (
  SELECT photo_id, COUNT(*)::int AS cnt
  FROM public.comments
  GROUP BY photo_id
) x
WHERE x.photo_id = p.id;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS photos_visibility_idx ON public.photos (visibility);
CREATE INDEX IF NOT EXISTS photos_status_idx ON public.photos (status);
CREATE INDEX IF NOT EXISTS photos_taken_at_idx ON public.photos (taken_at DESC);
CREATE INDEX IF NOT EXISTS photos_user_visibility_taken_at_idx
  ON public.photos (user_id, visibility, taken_at DESC);


-- =========================================================
-- 2) PHOTOS_METADATA: convert c2pa_status -> c2pa_verified (boolean)
-- =========================================================
DO $$
BEGIN
  -- If old column exists, rename it
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='photos_metadata'
      AND column_name='c2pa_status'
  ) THEN
    ALTER TABLE public.photos_metadata
      RENAME COLUMN c2pa_status TO c2pa_verified;
  END IF;

  -- If the column exists and is not boolean yet, convert it
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='photos_metadata'
      AND column_name='c2pa_verified'
      AND data_type <> 'boolean'
  ) THEN
    -- drop old default (was 'pending')
    ALTER TABLE public.photos_metadata
      ALTER COLUMN c2pa_verified DROP DEFAULT;

    -- convert varchar -> boolean with a safe mapping
    ALTER TABLE public.photos_metadata
      ALTER COLUMN c2pa_verified TYPE boolean
      USING (
        CASE
          WHEN c2pa_verified_at IS NOT NULL THEN true
          WHEN c2pa_verified IS NULL THEN false
          WHEN lower(c2pa_verified) IN ('verified','valid','success','passed','true','yes','y','1') THEN true
          ELSE false
        END
      );
  END IF;

  -- enforce boolean semantics
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='photos_metadata'
      AND column_name='c2pa_verified'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.photos_metadata
      ALTER COLUMN c2pa_verified SET DEFAULT false;

    -- column was previously NOT NULL; keep that behavior
    ALTER TABLE public.photos_metadata
      ALTER COLUMN c2pa_verified SET NOT NULL;
  END IF;
END $$;

-- Replace the old index (name-based) and create a new one
DROP INDEX IF EXISTS public.photos_metadata_c2pa_status_idx;
CREATE INDEX IF NOT EXISTS photos_metadata_c2pa_verified_idx
  ON public.photos_metadata (c2pa_verified);


-- =========================================================
-- 3) PHOTOS_METADATA: add useful ingest/EXIF/location columns (idempotent)
-- =========================================================
ALTER TABLE public.photos_metadata
  ADD COLUMN IF NOT EXISTS original_filename text NULL,
  ADD COLUMN IF NOT EXISTS file_ext text NULL,
  ADD COLUMN IF NOT EXISTS sha256 text NULL,
  ADD COLUMN IF NOT EXISTS phash bigint NULL,
  ADD COLUMN IF NOT EXISTS metadata_extracted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS captured_at_source text NULL, -- exif|user|file|inferred

  ADD COLUMN IF NOT EXISTS gps_lat double precision NULL,
  ADD COLUMN IF NOT EXISTS gps_lng double precision NULL,
  ADD COLUMN IF NOT EXISTS gps_alt double precision NULL,
  ADD COLUMN IF NOT EXISTS gps_accuracy_meters integer NULL,
  ADD COLUMN IF NOT EXISTS location_name text NULL,
  ADD COLUMN IF NOT EXISTS location_visibility text NOT NULL DEFAULT 'hidden', -- public|followers|private|hidden
  ADD COLUMN IF NOT EXISTS location_obfuscated boolean NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS color_space text NULL,
  ADD COLUMN IF NOT EXISTS bit_depth smallint NULL,
  ADD COLUMN IF NOT EXISTS has_alpha boolean NULL,
  ADD COLUMN IF NOT EXISTS is_hdr boolean NULL,

  ADD COLUMN IF NOT EXISTS focal_length_35mm integer NULL,
  ADD COLUMN IF NOT EXISTS exposure_compensation numeric(5,2) NULL,
  ADD COLUMN IF NOT EXISTS exposure_mode text NULL,
  ADD COLUMN IF NOT EXISTS metering_mode text NULL,
  ADD COLUMN IF NOT EXISTS white_balance text NULL,
  ADD COLUMN IF NOT EXISTS flash text NULL,
  ADD COLUMN IF NOT EXISTS focus_mode text NULL;

-- FIX: Use DO block because 'ADD CONSTRAINT IF NOT EXISTS' is invalid syntax
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'photos_metadata_location_visibility_check') THEN
    ALTER TABLE public.photos_metadata
      ADD CONSTRAINT photos_metadata_location_visibility_check
      CHECK (location_visibility IN ('public','followers','private','hidden'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS photos_metadata_sha256_idx ON public.photos_metadata (sha256);
CREATE INDEX IF NOT EXISTS photos_metadata_phash_idx ON public.photos_metadata (phash);
CREATE INDEX IF NOT EXISTS photos_metadata_gps_idx ON public.photos_metadata (gps_lat, gps_lng);

COMMIT;