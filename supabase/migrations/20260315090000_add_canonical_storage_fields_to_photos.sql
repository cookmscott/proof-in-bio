-- Add canonical storage fields to photos for provider-agnostic asset references
-- Keep legacy storage_url/storage_key columns for backward compatibility

BEGIN;

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS storage_provider text NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS object_key text,
  ADD COLUMN IF NOT EXISTS public_url text,
  ADD COLUMN IF NOT EXISTS signed_url text;

-- Backfill canonical columns from the existing Supabase-specific fields.
UPDATE public.photos
SET
  storage_provider = COALESCE(NULLIF(storage_provider, ''), 'supabase'),
  object_key = COALESCE(
    object_key,
    storage_key,
    NULLIF(
      substring(storage_url from '/storage/v1/object/public/photos/(.+)$'),
      ''
    )
  ),
  public_url = COALESCE(public_url, storage_url)
WHERE
  storage_provider IS NULL
  OR storage_provider = ''
  OR object_key IS NULL
  OR public_url IS NULL;

-- Only enforce NOT NULL once all existing rows have been backfilled.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.photos
    WHERE object_key IS NULL
  ) THEN
    ALTER TABLE public.photos
      ALTER COLUMN object_key SET NOT NULL;
  END IF;
END $$;

-- Helpful indexes for provider/key lookups and future migrations between backends.
CREATE INDEX IF NOT EXISTS photos_storage_provider_idx
  ON public.photos USING btree (storage_provider);

CREATE INDEX IF NOT EXISTS photos_object_key_idx
  ON public.photos USING btree (object_key);

COMMIT;
