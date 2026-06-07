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
  try {
    await ensurePodgeIdentitiesTable();

    const body = await request.json();
    const publicCode = asText(body.publicCode).toUpperCase();
    const recoveryCode = asText(body.recoveryCode);
    const deviceKey = asText(body.deviceKey);

    if (!publicCode || !recoveryCode || !deviceKey) {
      return NextResponse.json(
        { error: 'PODGE-ID, kode pemulihan, dan device key wajib diisi.' },
        { status: 400 },
      );
    }

    // Support login by either public_code or linked_farm_id (Farm ID)
    const result = await query<PodgeIdentityRecord>(
      'SELECT * FROM podge_identities WHERE UPPER(public_code) = $1 OR UPPER(linked_farm_id) = $1 LIMIT 1',
      [publicCode],
    );
    const identity = result.rows[0];

    if (!identity) {
      return NextResponse.json(
        { error: 'PODGE-ID tidak ditemukan. Periksa kembali ID atau Farm ID Anda.' },
        { status: 404 },
      );
    }

    if (!identity.is_active || identity.revoked_at) {
      return NextResponse.json(
        { error: 'PODGE-ID ini sudah tidak aktif atau telah dicabut.' },
        { status: 403 },
      );
    }

    if (!identity.recovery_code_hash) {
      return NextResponse.json(
        { error: 'PODGE-ID ini tidak memiliki kode pemulihan. Hubungi Super Admin.' },
        { status: 403 },
      );
    }

    // Validate the recovery code against its stored hash
    const recoveryCodeValid = hashIdentitySecret(recoveryCode) === identity.recovery_code_hash;
    if (!recoveryCodeValid) {
      return NextResponse.json(
        { error: 'Kode pemulihan tidak cocok. Periksa kembali atau hubungi Super Admin.' },
        { status: 403 },
      );
    }

    // Reset device hash to this new device
    const newDeviceHash = hashIdentitySecret(deviceKey);
    const updateResult = await query<PodgeIdentityRecord>(
      `UPDATE podge_identities
       SET claimed_device_hash = $2,
           is_claimed = true,
           claimed_at = COALESCE(claimed_at, NOW()),
           updated_at = NOW()
       WHERE identity_id = $1
       RETURNING *`,
      [identity.identity_id, newDeviceHash],
    );
    const updatedIdentity = updateResult.rows[0];

    // Set session cookie
    await setIdentitySession(updatedIdentity);

    // Log recovery event
    try {
      await appendLedgerEvent({
        entityType: 'identity',
        entityId: updatedIdentity.public_code,
        action: 'identity.recovered',
        actor: { name: updatedIdentity.display_name },
        payload: {
          identity_id: updatedIdentity.identity_id,
          identity_type: updatedIdentity.identity_type,
          linked_farm_id: updatedIdentity.linked_farm_id,
          recovery_method: 'recovery_code',
        },
      });
    } catch (ledgerError) {
      console.error('Ledger event failed during recovery:', ledgerError);
    }

    return NextResponse.json({
      success: true,
      identity: toPublicIdentity(updatedIdentity),
      message: 'Pemulihan perangkat berhasil. Akses PODGE-ID telah dipindahkan ke perangkat ini.',
    });
  } catch (error) {
    console.error('Error during identity recovery:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memulihkan identitas.' },
      { status: 500 },
    );
  }
}
