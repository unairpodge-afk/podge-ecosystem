import { NextRequest, NextResponse } from 'next/server';
import { ensureFarmerIdsTable, hashSecret, toPublicRecord, type FarmerIdRecord } from '@/lib/farmid';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  await ensureFarmerIdsTable();

  const body = await request.json();
  const farmId = typeof body.id === 'string' ? body.id : '';
  const token = typeof body.token === 'string' ? body.token : '';
  const deviceKey = typeof body.deviceKey === 'string' ? body.deviceKey : '';

  if (!farmId || !token || !deviceKey) {
    return NextResponse.json({ error: 'FarmID, token, dan device key wajib diisi.' }, { status: 400 });
  }

  const result = await query<FarmerIdRecord>('SELECT * FROM farmer_ids WHERE farm_id = $1', [farmId]);
  const record = result.rows[0];

  if (!record || hashSecret(token) !== record.private_token_hash) {
    return NextResponse.json({ error: 'Barcode private tidak valid.' }, { status: 403 });
  }

  const deviceHash = hashSecret(deviceKey);

  if (record.is_claimed) {
    if (record.claimed_device_hash === deviceHash) {
      return NextResponse.json({
        record: toPublicRecord(record),
        message: 'FarmID ini sudah diklaim di perangkat ini.',
        canEdit: true,
      });
    }

    return NextResponse.json({
      record: toPublicRecord(record),
      error: 'FarmID ini sudah diklaim oleh perangkat pertama. Anda hanya bisa melihat data publik.',
    }, { status: 409 });
  }

  const update = await query<FarmerIdRecord>(
    `UPDATE farmer_ids
     SET is_claimed = true, claimed_at = NOW(), claimed_device_hash = $2, updated_at = NOW()
     WHERE farm_id = $1
     RETURNING *`,
    [farmId, deviceHash],
  );

  return NextResponse.json({
    record: toPublicRecord(update.rows[0]),
    message: 'FarmID berhasil diklaim. Simpan barcode private dan perangkat ini.',
    canEdit: true,
  });
}
