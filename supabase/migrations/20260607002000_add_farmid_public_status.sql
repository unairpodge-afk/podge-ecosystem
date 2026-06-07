ALTER TABLE farmer_ids
  ADD COLUMN IF NOT EXISTS public_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS public_live_at TIMESTAMPTZ;

UPDATE farmer_ids
SET
  public_status = 'live',
  public_live_at = COALESCE(public_live_at, updated_at)
WHERE
  public_status = 'draft'
  AND (
    harvest_status <> 'Belum ada update panen'
    OR NULLIF(public_note, '') IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_farmer_ids_public_status ON farmer_ids(public_status);
