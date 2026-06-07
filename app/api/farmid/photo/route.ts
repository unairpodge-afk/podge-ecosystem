import { NextRequest, NextResponse } from 'next/server';
import { ensureFarmerIdsTable, hashSecret, toPublicRecord, type FarmerIdRecord } from '@/lib/farmid';
import { query } from '@/lib/db';
import { appendLedgerEvent } from '@/lib/ledger';

export async function POST(request: NextRequest) {
  try {
    await ensureFarmerIdsTable();

    const body = await request.json();
    const farmId = typeof body.id === 'string' ? body.id.trim() : '';
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const photoBase64 = typeof body.photo_base64 === 'string' ? body.photo_base64.trim() : null;

    if (!farmId || !token) {
      return NextResponse.json({ error: 'FarmID dan token wajib diisi.' }, { status: 400 });
    }

    const result = await query<FarmerIdRecord>('SELECT * FROM farmer_ids WHERE farm_id = $1', [farmId]);
    const record = result.rows[0];

    if (!record) {
      return NextResponse.json({ error: 'FarmID tidak ditemukan.' }, { status: 404 });
    }

    const tokenValid = hashSecret(token) === record.private_token_hash;
    if (!tokenValid) {
      return NextResponse.json({ error: 'Akses ditolak. Token tidak valid.' }, { status: 403 });
    }

    const updateResult = await query<FarmerIdRecord>(
      `UPDATE farmer_ids
       SET photo_base64 = $2, updated_at = NOW()
       WHERE farm_id = $1
       RETURNING *`,
      [farmId, photoBase64],
    );
    const updatedRecord = updateResult.rows[0];

    // Append to compliance ledger for audits
    try {
      await appendLedgerEvent({
        entityType: 'farmid',
        entityId: farmId,
        action: photoBase64 ? 'farmid.photo_updated' : 'farmid.photo_deleted',
        actor: { name: 'FarmID Private Token Holder' },
        payload: {
          farm_id: farmId,
          has_photo: Boolean(photoBase64),
        },
      });
    } catch (ledgerError) {
      console.error('Failed to append ledger event for photo update:', ledgerError);
    }

    return NextResponse.json({
      success: true,
      record: toPublicRecord(updatedRecord),
      message: photoBase64 ? 'Foto berhasil disimpan.' : 'Foto berhasil dihapus.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Gagal memperbarui foto: ${message}` }, { status: 500 });
  }
}
