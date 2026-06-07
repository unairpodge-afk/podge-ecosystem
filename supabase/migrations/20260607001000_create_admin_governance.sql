CREATE TABLE IF NOT EXISTS admin_roles (
  role_id TEXT PRIMARY KEY,
  role_name TEXT NOT NULL,
  description TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES admin_roles(role_id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_admin_id UUID REFERENCES admin_users(admin_id),
  actor_role_id TEXT REFERENCES admin_roles(role_id),
  actor_name TEXT NOT NULL DEFAULT 'System',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_hash TEXT,
  event_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE farmer_ids
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES admin_users(admin_id),
  ADD COLUMN IF NOT EXISTS verification_note TEXT;

CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_ledger_events_entity ON ledger_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ledger_events_created_at ON ledger_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_ids_verification_status ON farmer_ids(verification_status);

INSERT INTO admin_roles (role_id, role_name, description, permissions)
VALUES
  (
    'super_admin',
    'Super Admin',
    'Kontrol penuh atas PODGE governance engine.',
    '["farmid:verify","farmid:reject","ledger:view","traceability:verify","compliance:verify","green_sukuk:verify","admin:manage"]'::jsonb
  ),
  (
    'farmid_verifier',
    'FarmID Verifier',
    'Memverifikasi atau menolak identitas petani dan data dasar FarmID.',
    '["farmid:verify","farmid:reject","ledger:view"]'::jsonb
  ),
  (
    'koperasi_operator',
    'Koperasi Operator',
    'Mencatat dan memvalidasi data koperasi serta batch TBS dari petani.',
    '["traceability:create","traceability:verify","ledger:view"]'::jsonb
  ),
  (
    'pks_operator',
    'PKS Operator',
    'Memverifikasi penerimaan batch TBS di pabrik kelapa sawit.',
    '["traceability:receive","ledger:view"]'::jsonb
  ),
  (
    'logistics_operator',
    'Logistics Operator',
    'Memperbarui status pengiriman dan dokumen logistik rantai pasok.',
    '["traceability:ship","ledger:view"]'::jsonb
  ),
  (
    'esg_auditor',
    'ESG Auditor',
    'Memverifikasi kepatuhan ISPO, RSPO, NDPE, dan dokumen ESG.',
    '["compliance:verify","ledger:view"]'::jsonb
  ),
  (
    'finance_verifier',
    'Finance Verifier',
    'Memverifikasi proyek green sukuk dan aktivitas pembiayaan hijau.',
    '["green_sukuk:verify","ledger:view"]'::jsonb
  )
ON CONFLICT (role_id) DO UPDATE
SET
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;
