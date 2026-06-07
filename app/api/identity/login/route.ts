import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensurePodgeIdentitiesTable, setIdentitySession, toPublicIdentity, type PodgeIdentityRecord } from '@/lib/identity';
import { appendLedgerEvent } from '@/lib/ledger';

export async function POST(request: NextRequest) {
  try {
    await ensurePodgeIdentitiesTable();

    const body = await request.json();
    const publicCode = typeof body.publicCode === 'string' ? body.publicCode.trim().toUpperCase() : '';

    if (!publicCode) {
      return NextResponse.json({ error: 'PODGE-ID wajib diisi.' }, { status: 400 });
    }

    const result = await query<PodgeIdentityRecord>(
      'SELECT * FROM podge_identities WHERE UPPER(public_code) = $1 OR UPPER(linked_farm_id) = $1 LIMIT 1',
      [publicCode]
    );
    const identity = result.rows[0];

    if (!identity) {
      return NextResponse.json({ error: 'PODGE-ID tidak ditemukan. Silakan daftarkan diri jika belum memiliki ID.' }, { status: 404 });
    }

    if (!identity.is_active || identity.revoked_at) {
      return NextResponse.json({ error: 'PODGE-ID ini sudah tidak aktif atau dicabut.' }, { status: 403 });
    }

    // Set the session cookie
    await setIdentitySession(identity);

    // Log the login event
    await appendLedgerEvent({
      entityType: 'identity',
      entityId: identity.public_code,
      action: 'identity.logged_in',
      actor: { name: identity.display_name },
      payload: {
        identity_id: identity.identity_id,
        identity_type: identity.identity_type,
      },
    });

    return NextResponse.json({
      success: true,
      identity: toPublicIdentity(identity),
      message: 'Masuk berhasil.',
    });
  } catch (error) {
    console.error('Error during passwordless login:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat masuk.' }, { status: 500 });
  }
}
