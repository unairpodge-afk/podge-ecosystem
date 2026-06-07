import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  hashIdentitySecret,
  createPodgePrivateToken,
  type PodgeIdentityRecord,
} from '@/lib/identity';
import { requireAdmin } from '@/lib/admin-auth';
import { appendLedgerEvent } from '@/lib/ledger';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  // Must be a logged-in admin
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Akses ditolak. Hanya Super Admin yang dapat mereset token.' }, { status: 401 });
  }

  const body = await request.json();
  const identityId = asText(body.identityId);

  if (!identityId) {
    return NextResponse.json({ error: 'identity_id wajib diisi.' }, { status: 400 });
  }

  // Look up the identity
  const result = await query<PodgeIdentityRecord>(
    'SELECT * FROM podge_identities WHERE identity_id = $1 LIMIT 1',
    [identityId],
  );
  const identity = result.rows[0];

  if (!identity) {
    return NextResponse.json({ error: 'PODGE-ID tidak ditemukan.' }, { status: 404 });
  }

  // Generate fresh plaintext token
  const newToken = createPodgePrivateToken();
  const newTokenHash = hashIdentitySecret(newToken);

  await query(
    `UPDATE podge_identities
     SET private_token_hash = $2,
         token_rotated_at = NOW(),
         updated_at = NOW()
     WHERE identity_id = $1`,
    [identityId, newTokenHash],
  );

  // Audit log
  try {
    await appendLedgerEvent({
      entityType: 'identity',
      entityId: identity.public_code,
      action: 'identity.token_reset_by_admin',
      actor: { name: 'Super Admin' },
      payload: {
        identity_id: identity.identity_id,
        identity_type: identity.identity_type,
        display_name: identity.display_name,
        linked_farm_id: identity.linked_farm_id,
      },
    });
  } catch (err) {
    console.error('Ledger append failed during admin token reset:', err);
  }

  // Return the plaintext token ONE TIME — never stored
  return NextResponse.json({
    success: true,
    newToken,
    publicCode: identity.public_code,
    displayName: identity.display_name,
    message: `Token berhasil direset untuk ${identity.display_name}. Berikan token baru ini kepada anggota — ini adalah satu-satunya saat token ditampilkan.`,
  });
}
