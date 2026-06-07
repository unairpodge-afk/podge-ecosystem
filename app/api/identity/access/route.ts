import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  ensurePodgeIdentitiesTable,
  hashIdentitySecret,
  setIdentitySession,
  toPublicIdentity,
  type PodgeIdentityRecord,
} from '@/lib/identity';
import { appendLedgerEvent } from '@/lib/ledger';

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
    'SELECT * FROM podge_identities WHERE UPPER(public_code) = $1 OR UPPER(linked_farm_id) = $1 LIMIT 1',
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

    if (activeIdentity.linked_farm_id) {
      await query(
        `UPDATE farmer_ids
         SET is_claimed = true, claimed_at = NOW(), claimed_device_hash = $2, updated_at = NOW()
         WHERE farm_id = $1`,
        [activeIdentity.linked_farm_id, deviceHash]
      );
    }

    await appendLedgerEvent({
      entityType: 'identity',
      entityId: activeIdentity.public_code,
      action: 'identity.claimed',
      actor: { name: 'PODGE-ID Private QR Holder' },
      payload: {
        identity_id: activeIdentity.identity_id,
        identity_type: activeIdentity.identity_type,
        linked_farm_id: activeIdentity.linked_farm_id,
      },
    });
  }

  const sameDevice = activeIdentity.claimed_device_hash === deviceHash;

  if (!sameDevice) {
    return NextResponse.json({
      identity: toPublicIdentity(activeIdentity),
      error: 'PODGE-ID ini sudah diklaim di perangkat pertama. Gunakan perangkat tersebut atau recovery flow.',
    }, { status: 409 });
  }

  await setIdentitySession(activeIdentity);

  await appendLedgerEvent({
    entityType: 'identity',
    entityId: activeIdentity.public_code,
    action: 'identity.access_granted',
    actor: { name: 'PODGE-ID Private QR Holder' },
    payload: {
      identity_id: activeIdentity.identity_id,
      identity_type: activeIdentity.identity_type,
      linked_farm_id: activeIdentity.linked_farm_id,
      role_id: activeIdentity.role_id,
    },
  });

  return NextResponse.json({
    identity: toPublicIdentity(activeIdentity),
    message: 'Akses PODGE-ID berhasil. Simpan QR pribadi ini baik-baik.',
  });
}
