CREATE TABLE IF NOT EXISTS podge_identities (
  identity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT NOT NULL UNIQUE,
  private_token_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  identity_type TEXT NOT NULL,
  role_id TEXT REFERENCES admin_roles(role_id),
  linked_farm_id TEXT REFERENCES farmer_ids(farm_id),
  linked_admin_id UUID REFERENCES admin_users(admin_id),
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  claimed_device_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  token_rotated_at TIMESTAMPTZ,
  recovery_code_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT podge_identities_identity_type_check CHECK (
    identity_type IN (
      'farmer',
      'cooperative',
      'mill',
      'auditor',
      'admin',
      'logistics',
      'finance',
      'public_institution'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_podge_identities_public_code ON podge_identities(public_code);
CREATE INDEX IF NOT EXISTS idx_podge_identities_identity_type ON podge_identities(identity_type);
CREATE INDEX IF NOT EXISTS idx_podge_identities_role_id ON podge_identities(role_id);
CREATE INDEX IF NOT EXISTS idx_podge_identities_linked_farm_id ON podge_identities(linked_farm_id);
CREATE INDEX IF NOT EXISTS idx_podge_identities_linked_admin_id ON podge_identities(linked_admin_id);
CREATE INDEX IF NOT EXISTS idx_podge_identities_active ON podge_identities(is_active);

ALTER TABLE farmer_ids
  ADD COLUMN IF NOT EXISTS identity_id UUID REFERENCES podge_identities(identity_id);

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS identity_id UUID REFERENCES podge_identities(identity_id);
