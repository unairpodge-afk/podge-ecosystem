import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export type PodgeIdentityType =
  | 'farmer'
  | 'cooperative'
  | 'mill'
  | 'auditor'
  | 'admin'
  | 'logistics'
  | 'finance'
  | 'public_institution'
  | 'company'
  | 'investor';

export type PodgeIdentityRecord = {
  identity_id: string;
  public_code: string;
  private_token_hash: string;
  display_name: string;
  identity_type: PodgeIdentityType;
  role_id: string | null;
  linked_farm_id: string | null;
  linked_admin_id: string | null;
  phone_number: string | null;
  is_claimed: boolean;
  claimed_at: string | Date | null;
  claimed_device_hash: string | null;
  is_active: boolean;
  revoked_at: string | Date | null;
  revoked_reason: string | null;
  token_rotated_at: string | Date | null;
  recovery_code_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string | Date;
  updated_at: string | Date;
};

export type PublicPodgeIdentityRecord = Omit<
  PodgeIdentityRecord,
  'private_token_hash' | 'claimed_device_hash' | 'recovery_code_hash'
>;

const codePrefixes: Record<PodgeIdentityType, string> = {
  farmer: 'FARM',
  cooperative: 'KOP',
  mill: 'PKS',
  auditor: 'AUD',
  admin: 'ADMIN',
  logistics: 'LOG',
  finance: 'FIN',
  public_institution: 'PUB',
  company: 'PERUSAHAAN',
  investor: 'INVESTOR',
};

export async function ensurePodgeIdentitiesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS podge_identities (
      identity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      public_code TEXT NOT NULL UNIQUE,
      private_token_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      identity_type TEXT NOT NULL,
      role_id TEXT,
      linked_farm_id TEXT,
      linked_admin_id UUID,
      phone_number TEXT,
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Migrasi aman untuk database yang sudah ada
  await query(`
    ALTER TABLE podge_identities
      ADD COLUMN IF NOT EXISTS phone_number TEXT
  `);

  // Buat tabel OTP
  await query(`
    CREATE TABLE IF NOT EXISTS podge_otps (
      otp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      identity_id UUID REFERENCES podge_identities(identity_id) ON DELETE CASCADE,
      otp_code TEXT NOT NULL,
      expired_at TIMESTAMPTZ NOT NULL,
      is_used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  try {
    await query(`
      ALTER TABLE podge_identities 
      DROP CONSTRAINT IF EXISTS podge_identities_identity_type_check
    `);
    await query(`
      ALTER TABLE podge_identities 
      ADD CONSTRAINT podge_identities_identity_type_check CHECK (
        identity_type IN (
          'farmer', 'cooperative', 'mill', 'auditor', 'admin', 'logistics', 'finance', 'public_institution', 'company', 'investor'
        )
      )
    `);
  } catch (err) {
    console.error('Error updating podge_identities constraint:', err);
  }

  await query(`
    ALTER TABLE IF EXISTS farmer_ids
      ADD COLUMN IF NOT EXISTS identity_id UUID
  `);

  await query(`
    ALTER TABLE IF EXISTS admin_users
      ADD COLUMN IF NOT EXISTS identity_id UUID
  `);
}

export function createPodgePublicCode(identityType: PodgeIdentityType) {
  const prefix = codePrefixes[identityType];
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PODGE-ID-${prefix}-${suffix}`;
}

export function createPodgePrivateToken() {
  return crypto.randomBytes(28).toString('base64url');
}

export function createPodgeRecoveryCode() {
  return crypto.randomBytes(18).toString('base64url');
}

export function hashIdentitySecret(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function createIdentitySessionToken(identityId: string, publicCode: string) {
  return Buffer.from(JSON.stringify({
    identityId,
    publicCode,
    issuedAt: Date.now(),
    nonce: crypto.randomBytes(12).toString('hex'),
  })).toString('base64url');
}

export async function setIdentitySession(identity: Pick<PodgeIdentityRecord, 'identity_id' | 'public_code'>) {
  const cookieStore = await cookies();
  cookieStore.set('podge_identity_session', createIdentitySessionToken(identity.identity_id, identity.public_code), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getIdentitySession(): Promise<PodgeIdentityRecord | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('podge_identity_session');
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    
    const raw = Buffer.from(sessionCookie.value, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.identityId || !parsed.publicCode) {
      return null;
    }
    
    await ensurePodgeIdentitiesTable();
    const res = await query<PodgeIdentityRecord>(
      'SELECT * FROM podge_identities WHERE identity_id = $1 AND public_code = $2 LIMIT 1',
      [parsed.identityId, parsed.publicCode]
    );
    return res.rows[0] || null;
  } catch {
    return null;
  }
}

export function toPublicIdentity(record: PodgeIdentityRecord): PublicPodgeIdentityRecord {
  const publicRecord: Partial<PodgeIdentityRecord> = { ...record };
  delete publicRecord.private_token_hash;
  delete publicRecord.claimed_device_hash;
  delete publicRecord.recovery_code_hash;

  return publicRecord as PublicPodgeIdentityRecord;
}
