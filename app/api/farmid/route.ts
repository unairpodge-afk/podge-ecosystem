import { NextRequest, NextResponse } from 'next/server';
import {
  createFarmId,
  createPrivateToken,
  ensureFarmerIdsTable,
  hashSecret,
  toPublicRecord,
  type FarmerIdRecord,
} from '@/lib/farmid';
import { query } from '@/lib/db';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function POST(request: NextRequest) {
  await ensureFarmerIdsTable();

  const body = await request.json();
  const farmId = createFarmId();
  const privateToken = createPrivateToken();
  const farmerName = asText(body.farmerName, 'Petani PODGE');
  const cooperativeName = asText(body.cooperativeName, 'Koperasi Belum Diisi');
  const village = asText(body.village, 'Desa Belum Diisi');
  const district = asText(body.district, 'Kabupaten Belum Diisi');
  const province = asText(body.province, 'Provinsi Belum Diisi');
  const areaHectare = asNumber(body.areaHectare);

  const result = await query<FarmerIdRecord>(
    `INSERT INTO farmer_ids (
      farm_id, private_token_hash, farmer_name, cooperative_name, village,
      district, province, area_hectare
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [farmId, hashSecret(privateToken), farmerName, cooperativeName, village, district, province, areaHectare],
  );

  return NextResponse.json({
    record: toPublicRecord(result.rows[0]),
    privateToken,
  });
}

export async function GET(request: NextRequest) {
  await ensureFarmerIdsTable();

  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('id');
  const token = searchParams.get('token') || '';
  const deviceKey = searchParams.get('deviceKey') || '';

  if (!farmId) {
    return NextResponse.json({ error: 'FarmID wajib diisi.' }, { status: 400 });
  }

  const result = await query<FarmerIdRecord>('SELECT * FROM farmer_ids WHERE farm_id = $1', [farmId]);
  const record = result.rows[0];

  if (!record) {
    return NextResponse.json({ error: 'FarmID tidak ditemukan.' }, { status: 404 });
  }

  const tokenValid = Boolean(token) && hashSecret(token) === record.private_token_hash;
  const deviceValid = Boolean(deviceKey)
    && Boolean(record.claimed_device_hash)
    && hashSecret(deviceKey) === record.claimed_device_hash;

  return NextResponse.json({
    record: toPublicRecord(record),
    access: {
      tokenValid,
      canClaim: tokenValid && !record.is_claimed,
      canEdit: tokenValid && record.is_claimed && deviceValid,
      claimedOnThisDevice: record.is_claimed && deviceValid,
    },
  });
}
