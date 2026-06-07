const { Pool } = require('pg');
const fs = require('fs');
const crypto = require('crypto');

function hashSecret(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

(async () => {
  // Read .env.local for connection string
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = envContent.split(/\r?\n/).reduce((acc, line) => {
    const m = line.match(/^POSTGRES_URL=(.*)$/);
    if (m) acc.POSTGRES_URL = m[1].replace(/^"|"$/g, '');
    return acc;
  }, {});

  const pool = new Pool({ connectionString: env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log('Seeding compliance_evaluations...');
    // Delete any old seed records of these specific names to avoid duplicates
    await pool.query(`
      DELETE FROM compliance_evaluations 
      WHERE company_name IN ('PT Borneo Palm Energy', 'PT Riau Agromakmur', 'PT Sumatera Palm Lestari')
    `);
    
    await pool.query(`
      INSERT INTO compliance_evaluations (company_name, certification_type, status, audit_score, audit_date)
      VALUES 
        ('PT Borneo Palm Energy', 'EUDR Compliant', 'Terverifikasi', 94.0, '2026-06-01T17:00:00.000Z'),
        ('PT Riau Agromakmur', 'ISPO', 'Terverifikasi', 88.5, '2026-05-15T17:00:00.000Z'),
        ('PT Sumatera Palm Lestari', 'RSPO', 'Terverifikasi', 81.0, '2026-05-20T17:00:00.000Z')
    `);

    console.log('Seeding green_sukuk_projects...');
    await pool.query(`
      DELETE FROM green_sukuk_projects 
      WHERE project_name LIKE '%PT Borneo Palm Energy%' 
         OR project_name LIKE '%PT Riau Agromakmur%' 
         OR project_name LIKE '%PT Sumatera Palm Lestari%'
    `);

    await pool.query(`
      INSERT INTO green_sukuk_projects (project_name, location, fund_allocated, carbon_target, status)
      VALUES 
        ('Methane Capture Biogas POME - PT Borneo Palm Energy', 'Kalimantan Tengah', 120000000000.00, 45000.00, 'Berjalan'),
        ('Peremajaan Sawit Rakyat (Replanting) - PT Riau Agromakmur', 'Riau', 25000000000.00, 8500.00, 'Berjalan'),
        ('Composting Unit & Organic Fertilizer - PT Sumatera Palm Lestari', 'Sumatera Utara', 8000000000.00, 2200.00, 'Perencanaan')
    `);

    console.log('Seeding farmer_ids & podge_identities...');
    const farmers = [
      {
        farm_id: 'PODGE-FARM-BORNEO-001',
        token: 'token_borneo_001',
        recovery: 'recovery_borneo_001',
        farmer_name: 'Kelompok Tani Sawit Jaya Kotawaringin',
        cooperative_name: 'KUD Borneo Manunggal',
        village: 'Pasir Panjang',
        district: 'Arut Selatan',
        province: 'Kalimantan Tengah',
        area_hectare: 6.5,
        phone_number: '081234567890'
      },
      {
        farm_id: 'PODGE-FARM-RIAU-001',
        token: 'token_riau_001',
        recovery: 'recovery_riau_001',
        farmer_name: 'Kelompok Petani Blok A12',
        cooperative_name: 'Koperasi Tani Sawit Lestari Riau',
        village: 'Sei Pagar',
        district: 'Kampar',
        province: 'Riau',
        area_hectare: 24.7,
        phone_number: '081298765432'
      },
      {
        farm_id: 'PODGE-FARM-SUMUT-001',
        token: 'token_sumut_001',
        recovery: 'recovery_sumut_001',
        farmer_name: 'Kelompok Tani Harapan Makmur',
        cooperative_name: 'Koperasi Produsen Sawit Labuhanbatu',
        village: 'Janji',
        district: 'Labuhanbatu',
        province: 'Sumatera Utara',
        area_hectare: 5.2,
        phone_number: '081255556666'
      }
    ];

    for (const f of farmers) {
      // Clean up first
      await pool.query(`DELETE FROM podge_identities WHERE public_code = $1`, [f.farm_id]);
      await pool.query(`DELETE FROM farmer_ids WHERE farm_id = $1`, [f.farm_id]);

      // 1. Create Identity
      const identityRes = await pool.query(`
        INSERT INTO podge_identities (
          public_code, private_token_hash, display_name, identity_type, 
          is_claimed, phone_number, recovery_code_hash, metadata
        ) VALUES ($1, $2, $3, 'farmer', true, $4, $5, $6)
        RETURNING identity_id
      `, [
        f.farm_id,
        hashSecret(f.token),
        f.farmer_name,
        f.phone_number,
        hashSecret(f.recovery),
        JSON.stringify({
          source: 'seed_script',
          village: f.village,
          district: f.district,
          province: f.province,
          cooperative_name: f.cooperative_name
        })
      ]);
      
      const identityId = identityRes.rows[0].identity_id;

      // 2. Create Farmer ID
      await pool.query(`
        INSERT INTO farmer_ids (
          farm_id, private_token_hash, farmer_name, cooperative_name, village,
          district, province, area_hectare, is_claimed, verification_status,
          verified_at, public_status, identity_id, claimed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'verified', NOW(), 'live', $9, NOW())
      `, [
        f.farm_id,
        hashSecret(f.token),
        f.farmer_name,
        f.cooperative_name,
        f.village,
        f.district,
        f.province,
        f.area_hectare,
        identityId
      ]);

      // 3. Link identity back
      await pool.query(`
        UPDATE podge_identities SET linked_farm_id = $1 WHERE identity_id = $2
      `, [f.farm_id, identityId]);
    }

    console.log('Seeding traceability_logs...');
    await pool.query(`
      DELETE FROM traceability_logs 
      WHERE batch_id IN ('BATCH-BORNEO-2026-001', 'BATCH-PODGE-2100-001', 'BATCH-SUMUT-2026-001')
    `);

    await pool.query(`
      INSERT INTO traceability_logs (batch_id, farmer_name, tbs_weight_kg, pks_destination, blockchain_hash, status, created_at)
      VALUES 
        ('BATCH-BORNEO-2026-001', 'Kelompok Tani Sawit Jaya Kotawaringin', 3850.00, 'PKS PT Borneo Palm Energy Mill', '0x9c3d4e8b7f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5b6c7d', 'Terverifikasi', '2026-06-05T10:20:00.000Z'),
        ('BATCH-PODGE-2100-001', 'Kelompok Petani Blok A12', 4875.00, 'PKS PT Aura Sawit Traceable Mill', '0x9f0c72f4519c3a8e687c9a01542b7ddad83374ba5f07fb39c4a6f4a0c9ef2100', 'Terverifikasi', '2026-06-05T10:20:00.000Z'),
        ('BATCH-SUMUT-2026-001', 'Kelompok Tani Harapan Makmur', 3120.00, 'PKS PT Sumatera Palm Lestari Mill', '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b', 'Terverifikasi', '2026-06-05T10:20:00.000Z')
    `);

    console.log('Successfully seeded database for 3 integrated companies!');
  } catch (error) {
    console.error('Error seeding 3 companies:', error);
  } finally {
    await pool.end();
  }
})();
