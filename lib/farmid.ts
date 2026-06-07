import crypto from 'crypto';
import { query } from '@/lib/db';

export type FarmerIdRecord = {
  farm_id: string;
  identity_id: string | null;
  farmer_name: string;
  cooperative_name: string;
  village: string;
  district: string;
  province: string;
  area_hectare: string | number;
  commodity: string;
  harvest_status: string;
  public_status: string;
  public_live_at: string | Date | null;
  verification_status: string;
  verified_at: string | Date | null;
  verified_by: string | null;
  verification_note: string | null;
  public_note: string | null;
  is_claimed: boolean;
  claimed_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
  claimed_device_hash?: string | null;
  private_token_hash?: string;
  photo_base64?: string | null;
};

export type PublicFarmerIdRecord = Omit<FarmerIdRecord, 'private_token_hash' | 'claimed_device_hash'>;

export async function ensureFarmerIdsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS farmer_ids (
      farm_id TEXT PRIMARY KEY,
      identity_id UUID,
      private_token_hash TEXT NOT NULL,
      farmer_name TEXT NOT NULL,
      cooperative_name TEXT NOT NULL,
      village TEXT NOT NULL,
      district TEXT NOT NULL,
      province TEXT NOT NULL,
      area_hectare NUMERIC(12, 2) NOT NULL DEFAULT 0,
      commodity TEXT NOT NULL DEFAULT 'Kelapa Sawit',
      harvest_status TEXT NOT NULL DEFAULT 'Belum ada update panen',
      public_status TEXT NOT NULL DEFAULT 'draft',
      public_live_at TIMESTAMPTZ,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      verified_at TIMESTAMPTZ,
      verified_by UUID,
      verification_note TEXT,
      public_note TEXT,
      is_claimed BOOLEAN NOT NULL DEFAULT false,
      claimed_at TIMESTAMPTZ,
      claimed_device_hash TEXT,
      photo_base64 TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    ALTER TABLE farmer_ids
      ADD COLUMN IF NOT EXISTS identity_id UUID,
      ADD COLUMN IF NOT EXISTS public_status TEXT NOT NULL DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS public_live_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS verified_by UUID,
      ADD COLUMN IF NOT EXISTS verification_note TEXT,
      ADD COLUMN IF NOT EXISTS photo_base64 TEXT
  `);
}

export function createFarmId() {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PODGE-FARM-${new Date().getFullYear()}-${suffix}`;
}

export function createPrivateToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashSecret(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function toPublicRecord(record: FarmerIdRecord): PublicFarmerIdRecord {
  const publicRecord: Partial<FarmerIdRecord> = { ...record };
  delete publicRecord.private_token_hash;
  delete publicRecord.claimed_device_hash;

  return publicRecord as PublicFarmerIdRecord;
}
