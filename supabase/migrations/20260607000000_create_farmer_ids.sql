CREATE TABLE IF NOT EXISTS farmer_ids (
  farm_id TEXT PRIMARY KEY,
  private_token_hash TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  cooperative_name TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  province TEXT NOT NULL,
  area_hectare NUMERIC(12, 2) NOT NULL DEFAULT 0,
  commodity TEXT NOT NULL DEFAULT 'Kelapa Sawit',
  harvest_status TEXT NOT NULL DEFAULT 'Belum ada update panen',
  public_note TEXT,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  claimed_device_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
