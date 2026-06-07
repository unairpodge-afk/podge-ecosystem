import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getIdentitySession } from '@/lib/identity';
import { appendLedgerEvent } from '@/lib/ledger';

export async function POST(request: NextRequest) {
  try {
    const identity = await getIdentitySession();

    if (!identity) {
      return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();

    const updatedMetadata = {
      ...(identity.metadata || {}),
      ...body,
      updated_at: new Date().toISOString()
    };

    await query(
      `UPDATE podge_identities
       SET metadata = $2, updated_at = NOW()
       WHERE identity_id = $1`,
      [identity.identity_id, JSON.stringify(updatedMetadata)]
    );

    try {
      await appendLedgerEvent({
        entityType: 'identity',
        entityId: identity.public_code,
        action: 'identity.metadata_updated',
        actor: { name: identity.display_name },
        payload: {
          identity_id: identity.identity_id,
          updated_fields: Object.keys(body)
        }
      });
    } catch (ledgerErr) {
      console.error('Failed to log metadata update to ledger:', ledgerErr);
    }

    return NextResponse.json({ success: true, message: 'Metadata berhasil diperbarui.' });
  } catch (error) {
    console.error('Error in update-metadata:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat memperbarui data.' }, { status: 500 });
  }
}
