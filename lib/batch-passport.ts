import crypto from 'crypto';
import { query } from '@/lib/db';

export type TraceabilityLog = {
  id: string | number;
  batch_id: string;
  farmer_name: string;
  tbs_weight_kg: number | string;
  pks_destination: string;
  blockchain_hash: string;
  status: string;
  created_at: string | Date;
};

export type BatchPassport = TraceabilityLog & {
  estate: {
    name: string;
    province: string;
    district: string;
    centroid: { lat: number; lng: number };
    polygon: Array<{ lat: number; lng: number }>;
    areaHa: number;
  };
  cooperative: {
    name: string;
    registrationId: string;
    chairperson: string;
    validationStatus: string;
    verifiedAt: string;
  };
  farmer: {
    name: string;
    memberId: string;
    nationalIdMasked: string;
    phoneMasked: string;
  };
  certifications: Array<{
    scheme: 'ISPO' | 'RSPO';
    certificateNo: string;
    holder: string;
    validUntil: string;
    documentUrl: string;
    status: string;
  }>;
  evidencePhotos: Array<{
    label: string;
    url: string;
    capturedAt: string;
    geoTag: string;
    hash: string;
  }>;
  roles: Array<{
    role: 'Petani' | 'Koperasi' | 'PKS' | 'Auditor' | 'Admin';
    actor: string;
    authority: string;
    status: string;
  }>;
  auditTrail: Array<{
    time: string;
    actor: string;
    action: string;
    previousHash: string;
    entryHash: string;
  }>;
  antiFraudChecks: Array<{
    check: string;
    result: 'Pass' | 'Review' | 'Fail';
    detail: string;
  }>;
  logistics: {
    suratJalanNo: string;
    invoiceNo: string;
    truckPlate: string;
    driverMasked: string;
    distanceKm: number;
    maxDistanceKm: number;
  };
  pdfReportUrl: string;
};

export const featuredBatch: BatchPassport = {
  id: 'featured-podge-2100-001',
  batch_id: 'BATCH-PODGE-2100-001',
  farmer_name: 'Koperasi Tani Sawit Lestari Riau',
  tbs_weight_kg: 4875,
  pks_destination: 'PKS PT Aura Sawit Traceable Mill',
  blockchain_hash: '0x9f0c72f4519c3a8e687c9a01542b7ddad83374ba5f07fb39c4a6f4a0c9ef2100',
  status: 'Terverifikasi',
  created_at: '2026-06-05T08:40:00.000Z',
  estate: {
    name: 'Blok A12 Kebun Sei Pagar',
    province: 'Riau',
    district: 'Kampar',
    centroid: { lat: 0.37142, lng: 101.27688 },
    polygon: [
      { lat: 0.37491, lng: 101.27352 },
      { lat: 0.37538, lng: 101.28016 },
      { lat: 0.36902, lng: 101.28102 },
      { lat: 0.36788, lng: 101.27431 },
    ],
    areaHa: 24.7,
  },
  cooperative: {
    name: 'Koperasi Tani Sawit Lestari Riau',
    registrationId: 'KOP-RIAU-KPR-2026-0018',
    chairperson: 'H. M. Ridwan',
    validationStatus: 'Validated by PODGE Admin + Independent Auditor',
    verifiedAt: '2026-06-05T07:55:00.000Z',
  },
  farmer: {
    name: 'Kelompok Petani Blok A12',
    memberId: 'FARMER-GRP-A12-018',
    nationalIdMasked: '1401********0021',
    phoneMasked: '+62 812 **** 2100',
  },
  certifications: [
    {
      scheme: 'ISPO',
      certificateNo: 'ISPO/ID-RIAU/2026/0441',
      holder: 'Koperasi Tani Sawit Lestari Riau',
      validUntil: '2031-03-20',
      documentUrl: '/documents/ispo-batch-podge-2100-001.pdf',
      status: 'Valid',
    },
    {
      scheme: 'RSPO',
      certificateNo: 'RSPO-ISH-ID-2026-7782',
      holder: 'Koperasi Tani Sawit Lestari Riau',
      validUntil: '2030-11-18',
      documentUrl: '/documents/rspo-batch-podge-2100-001.pdf',
      status: 'Valid',
    },
  ],
  evidencePhotos: [
    {
      label: 'Foto Bukti Panen',
      url: '/evidence/batch-podge-2100-001-harvest.svg',
      capturedAt: '2026-06-05T07:12:00.000Z',
      geoTag: '0.37142, 101.27688',
      hash: 'sha256:67f6c6c17df52d12a4eb1c7091b0ab7a2100a12f0d7a9670b497071a5d4b8e7c',
    },
    {
      label: 'Foto Bukti Pengiriman',
      url: '/evidence/batch-podge-2100-001-delivery.svg',
      capturedAt: '2026-06-05T08:04:00.000Z',
      geoTag: '0.35581, 101.33422',
      hash: 'sha256:cc71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
    },
  ],
  roles: [
    { role: 'Petani', actor: 'Kelompok Petani Blok A12', authority: 'Create harvest evidence', status: 'Signed' },
    { role: 'Koperasi', actor: 'Koperasi Tani Sawit Lestari Riau', authority: 'Validate member and volume', status: 'Signed' },
    { role: 'PKS', actor: 'PKS PT Aura Sawit Traceable Mill', authority: 'Receive shipment', status: 'Signed' },
    { role: 'Auditor', actor: 'Auditor Independen ISPO/RSPO', authority: 'Verify certificates and geofence', status: 'Signed' },
    { role: 'Admin', actor: 'PODGE Governance Node', authority: 'Lock ledger record', status: 'Signed' },
  ],
  auditTrail: [
    {
      time: '2026-06-05T07:12:00.000Z',
      actor: 'Petani',
      action: 'Harvest photo and geolocation submitted',
      previousHash: 'GENESIS',
      entryHash: '0x50bb6d7990a5f82ff3b576817fb6cf710f8c8da2cd55dd12a14a2d3b4dff2100',
    },
    {
      time: '2026-06-05T07:48:00.000Z',
      actor: 'Koperasi',
      action: 'Volume weighed and cooperative identity validated',
      previousHash: '0x50bb6d7990a5f82ff3b576817fb6cf710f8c8da2cd55dd12a14a2d3b4dff2100',
      entryHash: '0xf6100c9112d6043891a727d900a6949a21007ca89cce4111f4cf2d64f4fd1c6a',
    },
    {
      time: '2026-06-05T08:40:00.000Z',
      actor: 'Auditor',
      action: 'ISPO/RSPO documents, distance, duplicate hash, and geofence checked',
      previousHash: '0xf6100c9112d6043891a727d900a6949a21007ca89cce4111f4cf2d64f4fd1c6a',
      entryHash: '0x9f0c72f4519c3a8e687c9a01542b7ddad83374ba5f07fb39c4a6f4a0c9ef2100',
    },
  ],
  antiFraudChecks: [
    { check: 'Duplicate hash detection', result: 'Pass', detail: 'No matching hash found in active ledger sample.' },
    { check: 'Volume anomaly', result: 'Pass', detail: '4,875 Kg is within cooperative route range of 2,000-6,500 Kg.' },
    { check: 'Distance sanity', result: 'Pass', detail: '86 Km route distance is below 120 Km regional max.' },
    { check: 'Geofence validation', result: 'Pass', detail: 'Harvest evidence coordinate falls inside Blok A12 polygon.' },
    { check: 'Role signature completeness', result: 'Pass', detail: 'Petani, koperasi, PKS, auditor, and admin signed the trail.' },
  ],
  logistics: {
    suratJalanNo: 'SJ-PODGE-2100-001',
    invoiceNo: 'INV-PODGE-2100-001',
    truckPlate: 'BM 2100 POD',
    driverMasked: 'DVR-****-018',
    distanceKm: 86,
    maxDistanceKm: 120,
  },
  pdfReportUrl: '/verify/BATCH-PODGE-2100-001/report.pdf',
};

export function getFeaturedTraceabilityLog(): TraceabilityLog {
  return {
    id: featuredBatch.id,
    batch_id: featuredBatch.batch_id,
    farmer_name: featuredBatch.farmer_name,
    tbs_weight_kg: featuredBatch.tbs_weight_kg,
    pks_destination: featuredBatch.pks_destination,
    blockchain_hash: featuredBatch.blockchain_hash,
    status: featuredBatch.status,
    created_at: featuredBatch.created_at,
  };
}

export function getTrustScore(batch: TraceabilityLog | BatchPassport) {
  let score = 62;

  if (batch.status === 'Terverifikasi') score += 22;
  if (batch.blockchain_hash?.startsWith('0x') && batch.blockchain_hash.length >= 64) score += 8;
  if (Number(batch.tbs_weight_kg) > 0) score += 5;
  if (batch.farmer_name && batch.pks_destination) score += 3;
  if ('antiFraudChecks' in batch && batch.antiFraudChecks.every((check) => check.result === 'Pass')) score += 4;

  return Math.min(score, 100);
}

export async function getBatchPassport(batchId: string): Promise<BatchPassport | null> {
  if (batchId === featuredBatch.batch_id) {
    return featuredBatch;
  }

  const result = await query('SELECT * FROM traceability_logs WHERE batch_id = $1 LIMIT 1', [batchId]);
  const batch = result.rows[0] as TraceabilityLog | undefined;

  if (!batch) {
    return null;
  }

  return {
    ...featuredBatch,
    ...batch,
    id: batch.id,
    batch_id: batch.batch_id,
    farmer_name: batch.farmer_name,
    tbs_weight_kg: batch.tbs_weight_kg,
    pks_destination: batch.pks_destination,
    blockchain_hash: batch.blockchain_hash,
    status: batch.status,
    created_at: batch.created_at,
    pdfReportUrl: `/verify/${encodeURIComponent(batch.batch_id)}/report.pdf`,
  };
}

export function hashReportPayload(batch: BatchPassport) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({
      batchId: batch.batch_id,
      farmer: batch.farmer_name,
      volume: batch.tbs_weight_kg,
      destination: batch.pks_destination,
      hash: batch.blockchain_hash,
      auditTrail: batch.auditTrail,
    }))
    .digest('hex');
}
