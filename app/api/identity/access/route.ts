import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  ensurePodgeIdentitiesTable,
  hashIdentitySecret,
  setIdentitySession,
  toPublicIdentity,
  type PodgeIdentityRecord,
} from '@/lib/identity';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  await ensurePodgeIdentitiesTable();

  const body = await request.json();
  const publicCode = asText(body.publicCode).toUpperCase();
  const token = asText(body.token);
  const deviceKey = asText(body.deviceKey);

  if (!publicCode || !token || !deviceKey) {
    return NextResponse.json({ error: 'PODGE-ID, private token, dan device key wajib diisi.' }, { status: 400 });
  }

  const result = await query<PodgeIdentityRecord>(
    'SELECT * FROM podge_identities WHERE public_code = $1 LIMIT 1',
    [publicCode],
  );
  const identity = result.rows[0];

  if (!identity || hashIdentitySecret(token) !== identity.private_token_hash) {
    return NextResponse.json({ error: 'PODGE-ID atau private token tidak cocok.' }, { status: 403 });
  }

  if (!identity.is_active || identity.revoked_at) {
    return NextResponse.json({ error: 'PODGE-ID ini sudah tidak aktif atau sudah dicabut.' }, { status: 403 });
  }

  const deviceHash = hashIdentitySecret(deviceKey);
  let activeIdentity = identity;

  if (!identity.is_claimed) {
    const update = await query<PodgeIdentityRecord>(
      `UPDATE podge_identities
       SET is_claimed = true, claimed_at = NOW(), claimed_device_hash = $2, updated_at = NOW()
       WHERE identity_id = $1
       RETURNING *`,
      [identity.identity_id, deviceHash],
    );
    activeIdentity = update.rows[0];
  }

  const sameDevice = activeIdentity.claimed_device_hash === deviceHash;

  if (!sameDevice) {
    return NextResponse.json({
      identity: toPublicIdentity(activeIdentity),
      error: 'PODGE-ID ini sudah diklaim di perangkat pertama. Gunakan perangkat tersebut atau recovery flow.',
    }, { status: 409 });
  }

  await setIdentitySession(activeIdentity);

  return NextResponse.json({
    identity: toPublicIdentity(activeIdentity),
    message: 'Akses PODGE-ID berhasil. Simpan QR pribadi ini baik-baik.',
  });
}
