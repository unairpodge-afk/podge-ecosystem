import { NextRequest, NextResponse } from 'next/server';
import { ensureFarmerIdsTable, hashSecret, toPublicRecord, type FarmerIdRecord } from '@/lib/farmid';
import { query } from '@/lib/db';
import { appendLedgerEvent } from '@/lib/ledger';

export async function POST(request: NextRequest) {
  await ensureFarmerIdsTable();

  const body = await request.json();
  const farmId = typeof body.id === 'string' ? body.id : '';
  const token = typeof body.token === 'string' ? body.token : '';
  const deviceKey = typeof body.deviceKey === 'string' ? body.deviceKey : '';
  const harvestStatus = typeof body.harvestStatus === 'string' && body.harvestStatus.trim()
    ? body.harvestStatus.trim()
    : 'Belum ada update panen';
  const publicNote = typeof body.publicNote === 'string' ? body.publicNote.trim() : '';

  if (!farmId || !token || !deviceKey) {
    return NextResponse.json({ error: 'FarmID, token, dan device key wajib diisi.' }, { status: 400 });
  }

  const result = await query<FarmerIdRecord>('SELECT * FROM farmer_ids WHERE farm_id = $1', [farmId]);
  const record = result.rows[0];
  const tokenValid = record && hashSecret(token) === record.private_token_hash;
  const deviceValid = record?.claimed_device_hash === hashSecret(deviceKey);

  if (!record || !tokenValid || !record.is_claimed || !deviceValid) {
    return NextResponse.json({
      error: 'Akses edit ditolak. Gunakan barcode private pada perangkat pertama yang melakukan klaim.',
    }, { status: 403 });
  }

  const update = await query<FarmerIdRecord>(
    `UPDATE farmer_ids
     SET
      harvest_status = $2,
      public_note = $3,
      public_status = 'live',
      public_live_at = COALESCE(public_live_at, NOW()),
      updated_at = NOW()
     WHERE farm_id = $1
     RETURNING *`,
    [farmId, harvestStatus, publicNote],
  );
  const updatedRecord = update.rows[0];

  await appendLedgerEvent({
    entityType: 'farmid',
    entityId: farmId,
    action: 'farmid.public_updated',
    actor: { name: 'FarmID Private QR Holder' },
    payload: {
      farm_id: farmId,
      identity_id: updatedRecord.identity_id,
      harvest_status: harvestStatus,
      public_status: updatedRecord.public_status,
      public_live_at: updatedRecord.public_live_at,
      has_public_note: Boolean(publicNote),
    },
  });

  return NextResponse.json({
    record: toPublicRecord(updatedRecord),
    message: 'Data publik FarmID berhasil diperbarui.',
  });
}
