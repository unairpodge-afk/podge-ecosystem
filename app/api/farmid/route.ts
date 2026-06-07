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
  createPodgePrivateToken,
  createPodgePublicCode,
  createPodgeRecoveryCode,
  ensurePodgeIdentitiesTable,
  hashIdentitySecret,
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
  await ensureFarmerIdsTable();
  await ensurePodgeIdentitiesTable();

  const body = await request.json();
  const farmId = createFarmId();
  const privateToken = createPrivateToken();
  const identityToken = createPodgePrivateToken();
  const recoveryCode = createPodgeRecoveryCode();
  const farmerName = asText(body.farmerName, 'Petani PODGE');
  const cooperativeName = asText(body.cooperativeName, 'Koperasi Belum Diisi');
  const village = asText(body.village, 'Desa Belum Diisi');
  const district = asText(body.district, 'Kabupaten Belum Diisi');
  const province = asText(body.province, 'Provinsi Belum Diisi');
  const areaHectare = asNumber(body.areaHectare);

  let identity: PodgeIdentityRecord | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const identityResult = await query<PodgeIdentityRecord>(
        `INSERT INTO podge_identities (
          public_code,
          private_token_hash,
          display_name,
          identity_type,
          recovery_code_hash,
          metadata
        )
        VALUES ($1, $2, $3, 'farmer', $4, $5::jsonb)
        RETURNING *`,
        [
          createPodgePublicCode('farmer'),
          hashIdentitySecret(identityToken),
          farmerName,
          hashIdentitySecret(recoveryCode),
          JSON.stringify({
            source: 'farmid_generate',
            pending_linked_farm_id: farmId,
            cooperative_name: cooperativeName,
            village,
            district,
            province,
          }),
        ],
      );
      identity = identityResult.rows[0];
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (!message.includes('duplicate') && !message.includes('unique')) {
        throw error;
      }
    }
  }

  if (!identity) {
    return NextResponse.json({ error: 'Gagal membuat PODGE-ID petani. Coba lagi.' }, { status: 500 });
  }

  const result = await query<FarmerIdRecord>(
    `INSERT INTO farmer_ids (
      farm_id, private_token_hash, farmer_name, cooperative_name, village,
      district, province, area_hectare, identity_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [farmId, hashSecret(privateToken), farmerName, cooperativeName, village, district, province, areaHectare, identity.identity_id],
  );
  const farmerRecord = result.rows[0];

  const linkedIdentityResult = await query<PodgeIdentityRecord>(
    `UPDATE podge_identities
     SET linked_farm_id = $2, updated_at = NOW()
     WHERE identity_id = $1
     RETURNING *`,
    [identity.identity_id, farmId],
  );
  identity = linkedIdentityResult.rows[0];

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
      action: 'identity.generated_for_farmid',
      actor: { name: 'PODGE FarmID Self-Service' },
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
    identityPrivateToken: identityToken,
    identityRecoveryCode: recoveryCode,
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
