import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  ensurePodgeIdentitiesTable,
  hashIdentitySecret,
  createPodgePrivateToken,
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
    const currentToken = asText(body.currentToken);
    const deviceKey = asText(body.deviceKey);

    if (!publicCode || !currentToken || !deviceKey) {
      return NextResponse.json(
        { error: 'PODGE-ID, token saat ini, dan device key wajib diisi.' },
        { status: 400 },
      );
    }

    // Find identity by public_code or linked_farm_id
    const result = await query<PodgeIdentityRecord>(
      'SELECT * FROM podge_identities WHERE UPPER(public_code) = $1 OR UPPER(linked_farm_id) = $1 LIMIT 1',
      [publicCode],
    );
    const identity = result.rows[0];

    if (!identity) {
      return NextResponse.json({ error: 'PODGE-ID tidak ditemukan.' }, { status: 404 });
    }

    if (!identity.is_active || identity.revoked_at) {
      return NextResponse.json(
        { error: 'PODGE-ID ini sudah tidak aktif atau dicabut.' },
        { status: 403 },
      );
    }

    // Verify current token
    if (hashIdentitySecret(currentToken) !== identity.private_token_hash) {
      return NextResponse.json(
        { error: 'Token saat ini tidak cocok. Pastikan token yang dimasukkan benar.' },
        { status: 403 },
      );
    }

    // Verify this is the claimed device
    const deviceHash = hashIdentitySecret(deviceKey);
    if (identity.is_claimed && identity.claimed_device_hash !== deviceHash) {
      return NextResponse.json(
        {
          error:
            'Rotasi token hanya dapat dilakukan dari perangkat pertama yang mengklaim PODGE-ID ini. Gunakan Recovery Code terlebih dahulu.',
        },
        { status: 409 },
      );
    }

    // Generate a fresh token
    const newToken = createPodgePrivateToken();
    const newTokenHash = hashIdentitySecret(newToken);

    const updateResult = await query<PodgeIdentityRecord>(
      `UPDATE podge_identities
       SET private_token_hash = $2,
           token_rotated_at = NOW(),
           updated_at = NOW()
       WHERE identity_id = $1
       RETURNING *`,
      [identity.identity_id, newTokenHash],
    );
    const updatedIdentity = updateResult.rows[0];

    // Refresh session
    await setIdentitySession(updatedIdentity);

    // Audit trail
    try {
      await appendLedgerEvent({
        entityType: 'identity',
        entityId: updatedIdentity.public_code,
        action: 'identity.token_rotated',
        actor: { name: updatedIdentity.display_name },
        payload: {
          identity_id: updatedIdentity.identity_id,
          identity_type: updatedIdentity.identity_type,
          linked_farm_id: updatedIdentity.linked_farm_id,
        },
      });
    } catch (ledgerError) {
      console.error('Ledger append failed for token rotation:', ledgerError);
    }

    return NextResponse.json({
      success: true,
      newToken,
      identity: toPublicIdentity(updatedIdentity),
      message:
        'Token berhasil diperbarui. Simpan token baru ini — token lama tidak bisa digunakan lagi.',
    });
  } catch (error) {
    console.error('Error rotating token:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat merotasi token.' },
      { status: 500 },
    );
  }
}
