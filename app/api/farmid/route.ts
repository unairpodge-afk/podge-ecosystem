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
import {
  ensurePodgeIdentitiesTable,
  getIdentitySession,
  toPublicIdentity,
  type PodgeIdentityRecord,
} from '@/lib/identity';
import { appendLedgerEvent } from '@/lib/ledger';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function POST(request: NextRequest) {
  const activeIdentity = await getIdentitySession();

  if (!activeIdentity) {
    return NextResponse.json(
      { error: 'Silakan daftar dan masuk terlebih dahulu sebelum membuat FarmID.' },
      { status: 401 },
    );
  }

  if (activeIdentity.identity_type !== 'farmer') {
    return NextResponse.json(
      { error: 'FarmID hanya dapat dibuat oleh akun Petani Mandiri.' },
      { status: 403 },
    );
  }

  if (activeIdentity.linked_farm_id) {
    return NextResponse.json(
      { error: 'Akun ini sudah memiliki FarmID. Gunakan menu Lihat Kartu Anggota.' },
      { status: 409 },
    );
  }

  await ensureFarmerIdsTable();
  await ensurePodgeIdentitiesTable();

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
      district, province, area_hectare, identity_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      farmId,
      hashSecret(privateToken),
      farmerName,
      cooperativeName,
      village,
      district,
      province,
      areaHectare,
      activeIdentity.identity_id,
    ],
  );
  const farmerRecord = result.rows[0];

  const linkedIdentityResult = await query<PodgeIdentityRecord>(
    `UPDATE podge_identities
     SET linked_farm_id = $2,
         display_name = COALESCE(NULLIF($3, ''), display_name),
         metadata = metadata || $4::jsonb,
         updated_at = NOW()
     WHERE identity_id = $1
       AND linked_farm_id IS NULL
     RETURNING *`,
    [
      activeIdentity.identity_id,
      farmId,
      farmerName,
      JSON.stringify({
        farmid_generated_at: new Date().toISOString(),
        cooperative_name: cooperativeName,
        village,
        district,
        province,
      }),
    ],
  );
  const identity = linkedIdentityResult.rows[0];

  if (!identity) {
    return NextResponse.json(
      { error: 'Akun ini sudah memiliki FarmID atau tidak bisa ditautkan.' },
      { status: 409 },
    );
  }

  try {
    await appendLedgerEvent({
      entityType: 'farmid',
      entityId: farmId,
      action: 'farmid.generated',
      actor: { name: 'PODGE FarmID Self-Service' },
      payload: {
        farm_id: farmId,
        identity_id: identity.identity_id,
        identity_public_code: identity.public_code,
        farmer_name: farmerName,
        cooperative_name: cooperativeName,
        village,
        district,
        province,
        area_hectare: areaHectare,
      },
    });

    await appendLedgerEvent({
      entityType: 'identity',
      entityId: identity.public_code,
      action: 'identity.linked_to_farmid',
      actor: { name: farmerName },
      payload: {
        identity_id: identity.identity_id,
        identity_type: identity.identity_type,
        linked_farm_id: farmId,
      },
    });
  } catch (ledgerError) {
    console.error('FarmID generated but ledger append failed:', ledgerError);
  }

  return NextResponse.json({
    record: toPublicRecord(farmerRecord),
    privateToken,
    identity: toPublicIdentity(identity),
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
