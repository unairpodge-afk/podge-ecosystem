import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { createPodgePublicCode, createPodgePrivateToken, hashIdentitySecret } from '@/lib/identity';
import crypto from 'crypto';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin();

    // Generate 100 Farmers
    // 80 Good, 10 Medium, 10 Bad
    let generatedCount = 0;

    for (let i = 0; i < 100; i++) {
      let type = 'good';
      if (i >= 80 && i < 90) type = 'medium';
      if (i >= 90) type = 'bad';

      const publicCode = createPodgePublicCode('farmer');
      const privateToken = createPodgePrivateToken();
      const privateTokenHash = hashIdentitySecret(privateToken);
      
      const identityId = crypto.randomUUID();
      const displayName = `Petani Simulasi ABM #${i + 1}`;
      
      const farmIdCode = `PODGE-FARM-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Insert Identity
      await query(`
        INSERT INTO podge_identities 
        (identity_id, public_code, private_token_hash, display_name, identity_type, is_claimed, claimed_at, linked_farm_id)
        VALUES ($1, $2, $3, $4, 'farmer', true, NOW(), $5)
      `, [identityId, publicCode, privateTokenHash, displayName, farmIdCode]);

      let verificationStatus = 'verified';
      let publicStatus = 'Terverifikasi';
      
      if (type === 'medium') {
        verificationStatus = 'pending';
        publicStatus = 'Menunggu Audit';
      } else if (type === 'bad') {
        verificationStatus = 'rejected';
        publicStatus = 'Ditolak (Deforestasi)';
      }

      // Insert Farm ID
      await query(`
        INSERT INTO farmer_ids
        (farm_id, farmer_name, identity_id, id_card_number, province, district, village, area_hectare, commodity, verification_status, public_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        farmIdCode,
        displayName,
        identityId,
        `1234567890${String(i).padStart(6, '0')}`,
        'Riau',
        'Pelalawan',
        'Pangkalan Kerinci',
        (Math.random() * 5 + 1).toFixed(2), // 1 to 6 hectares
        'Kelapa Sawit (TBS)',
        verificationStatus,
        publicStatus
      ]);

      // Insert Traceability Log
      const batchId = `BATCH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      let traceStatus = 'Terverifikasi';
      if (type === 'medium') traceStatus = 'Menunggu Verifikasi';
      if (type === 'bad') traceStatus = 'Ditolak (Mutu Buruk)';

      const tbsWeight = randomInt(2000, 8000);

      await query(`
        INSERT INTO traceability_logs
        (batch_id, farm_id, farmer_name, tbs_weight_kg, pks_destination, status, blockchain_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        batchId,
        farmIdCode,
        displayName,
        tbsWeight,
        'PT Riau Agromakmur',
        traceStatus,
        '0x' + crypto.randomBytes(32).toString('hex')
      ]);

      generatedCount++;
    }

    return NextResponse.json({ success: true, message: `Berhasil men-generate ${generatedCount} profil petani simulasi.` });
  } catch (err: any) {
    if (err?.message?.includes('NEXT_REDIRECT')) throw err;
    console.error('Seeder error:', err);
    return NextResponse.json({ error: 'Gagal melakukan seed database' }, { status: 500 });
  }
}
