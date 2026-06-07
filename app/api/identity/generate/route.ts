import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import {
  createPodgePrivateToken,
  createPodgePublicCode,
  createPodgeRecoveryCode,
  ensurePodgeIdentitiesTable,
  hashIdentitySecret,
  toPublicIdentity,
  type PodgeIdentityRecord,
  type PodgeIdentityType,
} from '@/lib/identity';

const identityTypes: PodgeIdentityType[] = [
  'farmer',
  'cooperative',
  'mill',
  'auditor',
  'admin',
  'logistics',
  'finance',
  'public_institution',
];

function isIdentityType(value: unknown): value is PodgeIdentityType {
  return typeof value === 'string' && identityTypes.includes(value as PodgeIdentityType);
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function canGenerateIdentity(roleId: string) {
  return roleId === 'super_admin' || roleId === 'farmid_verifier';
}

export async function POST(request: NextRequest) {
  const { admin } = await requireAdmin();

  if (!canGenerateIdentity(admin.role_id)) {
    return NextResponse.json({ error: 'Role admin ini belum boleh generate PODGE-ID.' }, { status: 403 });
  }

  await ensurePodgeIdentitiesTable();

  const body = await request.json();
  const identityType = isIdentityType(body.identityType) ? body.identityType : null;
  const displayName = asText(body.displayName);
  const roleId = asText(body.roleId) || null;
  const linkedFarmId = asText(body.linkedFarmId) || null;
  const metadataNote = asText(body.metadataNote);

  if (!identityType || !displayName) {
    return NextResponse.json({ error: 'Tipe identity dan nama wajib diisi.' }, { status: 400 });
  }

  const privateToken = createPodgePrivateToken();
  const recoveryCode = createPodgeRecoveryCode();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicCode = createPodgePublicCode(identityType);

    try {
      const result = await query<PodgeIdentityRecord>(
        `INSERT INTO podge_identities (
          public_code,
          private_token_hash,
          display_name,
          identity_type,
          role_id,
          linked_farm_id,
          recovery_code_hash,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        RETURNING *`,
        [
          publicCode,
          hashIdentitySecret(privateToken),
          displayName,
          identityType,
          roleId,
          linkedFarmId,
          hashIdentitySecret(recoveryCode),
          JSON.stringify({
            note: metadataNote,
            generated_by_admin_id: admin.admin_id,
            generated_by_role: admin.role_id,
          }),
        ],
      );

      return NextResponse.json({
        identity: toPublicIdentity(result.rows[0]),
        privateToken,
        recoveryCode,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (!message.includes('duplicate') && !message.includes('unique')) {
        throw error;
      }
    }
  }

  return NextResponse.json({ error: 'Gagal membuat public code unik. Coba lagi.' }, { status: 500 });
}
