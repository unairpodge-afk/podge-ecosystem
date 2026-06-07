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
  tbsDetails: {
    transactionId: string;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    quality: string;
  };
  transportationDetails: {
    deliveryId: string;
    licensePlate: string;
    driver: string;
    departureTime: string;
    arrivalTime: string;
    gpsStatus: string;
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
  created_at: '2026-06-05T10:20:00.000Z',
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
    verifiedAt: '2026-06-05T07:48:00.000Z',
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
      documentUrl: '#',
      status: 'Valid',
    },
    {
      scheme: 'RSPO',
      certificateNo: 'RSPO-ISH-ID-2026-7782',
      holder: 'Koperasi Tani Sawit Lestari Riau',
      validUntil: '2030-11-18',
      documentUrl: '#',
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
      geoTag: '0.45581, 101.93422',
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
      time: '2026-06-05T09:49:00.000Z',
      actor: 'PKS',
      action: 'TBS delivery arrived, weighed, and accepted at Mill reception',
      previousHash: '0xf6100c9112d6043891a727d900a6949a21007ca89cce4111f4cf2d64f4fd1c6a',
      entryHash: '0x3c71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
    },
    {
      time: '2026-06-05T10:20:00.000Z',
      actor: 'Auditor',
      action: 'ISPO/RSPO compliance documents and geofencing validation finalized',
      previousHash: '0x3c71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
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
  tbsDetails: {
    transactionId: 'TX-TBS-2100-001',
    grossWeight: 7325,
    tareWeight: 2450,
    netWeight: 4875,
    quality: 'Kelas A (Super)',
  },
  transportationDetails: {
    deliveryId: 'TR-LOG-2100-001',
    licensePlate: 'BM 2100 POD',
    driver: 'Budi Santoso',
    departureTime: '2026-06-05T08:04:00.000Z',
    arrivalTime: '2026-06-05T09:49:00.000Z',
    gpsStatus: 'Active (Locked GPS-Track)',
  },
  pdfReportUrl: '/verify/BATCH-PODGE-2100-001/report.pdf',
};

export const borneoBatch: BatchPassport = {
  id: 'featured-borneo-2026-001',
  batch_id: 'BATCH-BORNEO-2026-001',
  farmer_name: 'Kelompok Tani Sawit Jaya Kotawaringin',
  tbs_weight_kg: 3850,
  pks_destination: 'PKS PT Borneo Palm Energy Mill',
  blockchain_hash: '0x9c3d4e8b7f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5b6c7d',
  status: 'Terverifikasi',
  created_at: '2026-06-05T10:20:00.000Z',
  estate: {
    name: 'Kavling Sawit Mandiri - Blok Borneo B3',
    province: 'Kalimantan Tengah',
    district: 'Arut Selatan',
    centroid: { lat: -2.4172, lng: 111.6214 },
    polygon: [
      { lat: -2.4140, lng: 111.6180 },
      { lat: -2.4140, lng: 111.6250 },
      { lat: -2.4200, lng: 111.6250 },
      { lat: -2.4200, lng: 111.6180 }
    ],
    areaHa: 6.5,
  },
  cooperative: {
    name: 'KUD Borneo Manunggal',
    registrationId: 'KOP-KALTENG-KOBAR-2026-0092',
    chairperson: 'Bapak H. Ahmad Dahlan',
    validationStatus: 'Validated by PODGE Admin + Independent Auditor',
    verifiedAt: '2026-06-05T07:48:00.000Z',
  },
  farmer: {
    name: 'Kelompok Tani Sawit Jaya Kotawaringin',
    memberId: 'FARMER-GRP-KOBAR-092',
    nationalIdMasked: '6201********0014',
    phoneMasked: '+62 812 **** 7890',
  },
  certifications: [
    {
      scheme: 'ISPO',
      certificateNo: 'ISPO/ID-KALTENG/2026/0882',
      holder: 'KUD Borneo Manunggal',
      validUntil: '2031-05-10',
      documentUrl: '#',
      status: 'Valid',
    }
  ],
  evidencePhotos: [
    {
      label: 'Foto Bukti Panen',
      url: '/evidence/batch-podge-2100-001-harvest.svg',
      capturedAt: '2026-06-05T07:12:00.000Z',
      geoTag: '-2.4172, 111.6214',
      hash: 'sha256:7c3d4e8b7f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5b6c7d',
    },
    {
      label: 'Foto Bukti Pengiriman',
      url: '/evidence/batch-podge-2100-001-delivery.svg',
      capturedAt: '2026-06-05T08:04:00.000Z',
      geoTag: '-2.3850, 111.6520',
      hash: 'sha256:cc71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
    },
  ],
  roles: [
    { role: 'Petani', actor: 'Kelompok Tani Sawit Jaya Kotawaringin', authority: 'Create harvest evidence', status: 'Signed' },
    { role: 'Koperasi', actor: 'KUD Borneo Manunggal', authority: 'Validate member and volume', status: 'Signed' },
    { role: 'PKS', actor: 'PKS PT Borneo Palm Energy Mill', authority: 'Receive shipment', status: 'Signed' },
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
      time: '2026-06-05T09:49:00.000Z',
      actor: 'PKS',
      action: 'TBS delivery arrived, weighed, and accepted at Mill reception',
      previousHash: '0xf6100c9112d6043891a727d900a6949a21007ca89cce4111f4cf2d64f4fd1c6a',
      entryHash: '0x3c71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
    },
    {
      time: '2026-06-05T10:20:00.000Z',
      actor: 'Auditor',
      action: 'ISPO compliance documents and geofencing validation finalized',
      previousHash: '0x3c71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
      entryHash: '0x9c3d4e8b7f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5b6c7d',
    },
  ],
  antiFraudChecks: [
    { check: 'Duplicate hash detection', result: 'Pass', detail: 'No matching hash found in active ledger sample.' },
    { check: 'Volume anomaly', result: 'Pass', detail: '3,850 Kg is within cooperative route range.' },
    { check: 'Distance sanity', result: 'Pass', detail: '38 Km route distance is below 120 Km regional max.' },
    { check: 'Geofence validation', result: 'Pass', detail: 'Harvest evidence coordinate falls inside Blok Borneo B3 polygon.' },
    { check: 'Role signature completeness', result: 'Pass', detail: 'Petani, koperasi, PKS, auditor, and admin signed the trail.' },
  ],
  logistics: {
    suratJalanNo: 'SJ-BORNEO-2026-001',
    invoiceNo: 'INV-BORNEO-2026-001',
    truckPlate: 'KH 8801 KB',
    driverMasked: 'DVR-****-092',
    distanceKm: 38,
    maxDistanceKm: 120,
  },
  tbsDetails: {
    transactionId: 'TX-TBS-BORNEO-001',
    grossWeight: 6350,
    tareWeight: 2500,
    netWeight: 3850,
    quality: 'Kelas A (Super)',
  },
  transportationDetails: {
    deliveryId: 'TR-LOG-BORNEO-001',
    licensePlate: 'KH 8801 KB',
    driver: 'Joko Wahyudi',
    departureTime: '2026-06-05T08:04:00.000Z',
    arrivalTime: '2026-06-05T09:49:00.000Z',
    gpsStatus: 'Active (Locked GPS-Track)',
  },
  pdfReportUrl: '/verify/BATCH-BORNEO-2026-001/report.pdf',
};

export const sumutBatch: BatchPassport = {
  id: 'featured-sumut-2026-001',
  batch_id: 'BATCH-SUMUT-2026-001',
  farmer_name: 'Kelompok Tani Harapan Makmur',
  tbs_weight_kg: 3120,
  pks_destination: 'PKS PT Sumatera Palm Lestari Mill',
  blockchain_hash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
  status: 'Terverifikasi',
  created_at: '2026-06-05T10:20:00.000Z',
  estate: {
    name: 'Kavling Sawit Mandiri - Blok Sumut H5',
    province: 'Sumatera Utara',
    district: 'Labuhanbatu',
    centroid: { lat: 2.1524, lng: 99.8245 },
    polygon: [
      { lat: 2.1550, lng: 99.8210 },
      { lat: 2.1550, lng: 99.8280 },
      { lat: 2.1500, lng: 99.8280 },
      { lat: 2.1500, lng: 99.8210 }
    ],
    areaHa: 5.2,
  },
  cooperative: {
    name: 'Koperasi Produsen Sawit Labuhanbatu',
    registrationId: 'KOP-SUMUT-LAB-2026-0115',
    chairperson: 'Bapak H. Syamsul Arifin',
    validationStatus: 'Validated by PODGE Admin + Independent Auditor',
    verifiedAt: '2026-06-05T07:48:00.000Z',
  },
  farmer: {
    name: 'Kelompok Tani Harapan Makmur',
    memberId: 'FARMER-GRP-LAB-115',
    nationalIdMasked: '1207********0032',
    phoneMasked: '+62 812 **** 6666',
  },
  certifications: [
    {
      scheme: 'RSPO',
      certificateNo: 'RSPO-ISH-ID-2026-8891',
      holder: 'Koperasi Produsen Sawit Labuhanbatu',
      validUntil: '2030-12-15',
      documentUrl: '#',
      status: 'Valid',
    }
  ],
  evidencePhotos: [
    {
      label: 'Foto Bukti Panen',
      url: '/evidence/batch-podge-2100-001-harvest.svg',
      capturedAt: '2026-06-05T07:12:00.000Z',
      geoTag: '2.1524, 99.8245',
      hash: 'sha256:8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    },
    {
      label: 'Foto Bukti Pengiriman',
      url: '/evidence/batch-podge-2100-001-delivery.svg',
      capturedAt: '2026-06-05T08:04:00.000Z',
      geoTag: '2.2240, 99.8920',
      hash: 'sha256:cc71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
    },
  ],
  roles: [
    { role: 'Petani', actor: 'Kelompok Tani Harapan Makmur', authority: 'Create harvest evidence', status: 'Signed' },
    { role: 'Koperasi', actor: 'Koperasi Produsen Sawit Labuhanbatu', authority: 'Validate member and volume', status: 'Signed' },
    { role: 'PKS', actor: 'PKS PT Sumatera Palm Lestari Mill', authority: 'Receive shipment', status: 'Signed' },
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
      time: '2026-06-05T09:49:00.000Z',
      actor: 'PKS',
      action: 'TBS delivery arrived, weighed, and accepted at Mill reception',
      previousHash: '0xf6100c9112d6043891a727d900a6949a21007ca89cce4111f4cf2d64f4fd1c6a',
      entryHash: '0x3c71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
    },
    {
      time: '2026-06-05T10:20:00.000Z',
      actor: 'Auditor',
      action: 'RSPO compliance documents and geofencing validation finalized',
      previousHash: '0x3c71a41a90e9fb3cb272032ff9f4542a2100d3f86fa4f51b722873af4b59a6be',
      entryHash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    },
  ],
  antiFraudChecks: [
    { check: 'Duplicate hash detection', result: 'Pass', detail: 'No matching hash found in active ledger sample.' },
    { check: 'Volume anomaly', result: 'Pass', detail: '3,120 Kg is within cooperative capacity.' },
    { check: 'Distance sanity', result: 'Pass', detail: '24 Km route distance is below 120 Km regional max.' },
    { check: 'Geofence validation', result: 'Pass', detail: 'Harvest evidence coordinate falls inside Blok Sumut H5 polygon.' },
    { check: 'Role signature completeness', result: 'Pass', detail: 'Petani, koperasi, PKS, auditor, and admin signed the trail.' },
  ],
  logistics: {
    suratJalanNo: 'SJ-SUMUT-2026-001',
    invoiceNo: 'INV-SUMUT-2026-001',
    truckPlate: 'BK 9054 YL',
    driverMasked: 'DVR-****-115',
    distanceKm: 24,
    maxDistanceKm: 120,
  },
  tbsDetails: {
    transactionId: 'TX-TBS-SUMUT-001',
    grossWeight: 5520,
    tareWeight: 2400,
    netWeight: 3120,
    quality: 'Kelas A (Super)',
  },
  transportationDetails: {
    deliveryId: 'TR-LOG-SUMUT-001',
    licensePlate: 'BK 9054 YL',
    driver: 'Rahmat Hidayat',
    departureTime: '2026-06-05T08:04:00.000Z',
    arrivalTime: '2026-06-05T09:49:00.000Z',
    gpsStatus: 'Active (Locked GPS-Track)',
  },
  pdfReportUrl: '/verify/BATCH-SUMUT-2026-001/report.pdf',
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
  if (batchId === borneoBatch.batch_id) {
    return borneoBatch;
  }
  if (batchId === sumutBatch.batch_id) {
    return sumutBatch;
  }

  const result = await query('SELECT * FROM traceability_logs WHERE batch_id = $1 LIMIT 1', [batchId]);
  const batch = result.rows[0] as TraceabilityLog | undefined;

  if (!batch) {
    return null;
  }

  // Create a deterministic hash integer from batchId to make fields unique
  let seed = 0;
  for (let i = 0; i < batch.batch_id.length; i++) {
    seed = (seed << 5) - seed + batch.batch_id.charCodeAt(i);
    seed |= 0;
  }
  const absSeed = Math.abs(seed);

  // Dynamic geolocations centered around Riau area
  const lat = 0.3 + (absSeed % 100) / 1000;
  const lng = 101.2 + ((absSeed >> 2) % 100) / 1000;
  const areaHa = 2.5 + (absSeed % 50) / 10;

  const polygon = [
    { lat: lat + 0.0035, lng: lng - 0.0035 },
    { lat: lat + 0.0035, lng: lng + 0.0035 },
    { lat: lat - 0.0035, lng: lng + 0.0035 },
    { lat: lat - 0.0035, lng: lng - 0.0035 },
  ];

  const truckPlate = `BM ${1000 + (absSeed % 8999)} ${String.fromCharCode(65 + (absSeed % 26))}${String.fromCharCode(65 + ((absSeed >> 1) % 26))}`;
  const weight = Number(batch.tbs_weight_kg);
  const isVerified = batch.status === 'Terverifikasi';

  // Smart Cooperative & Farmer Naming
  let cooperativeName = '';
  let farmerGroupName = '';
  if (batch.farmer_name.toLowerCase().includes('koperasi') || batch.farmer_name.toLowerCase().includes('kud') || batch.farmer_name.toLowerCase().includes('kop')) {
    cooperativeName = batch.farmer_name;
    const cleanName = batch.farmer_name
      .replace(/koperasi/gi, '')
      .replace(/kud/gi, '')
      .replace(/kop/gi, '')
      .trim();
    farmerGroupName = `Kelompok Petani Binaan ${cleanName}`;
  } else {
    farmerGroupName = batch.farmer_name;
    cooperativeName = batch.farmer_name.toLowerCase().includes('kelompok')
      ? batch.farmer_name.replace(/kelompok tani/gi, 'Koperasi Tani').replace(/kelompok/gi, 'Koperasi')
      : `Koperasi Mitra ${batch.farmer_name}`;
  }

  // Calculate distance and travel duration
  const distanceKm = 30 + (absSeed % 80);
  const travelDurationMinutes = Math.round((distanceKm / 50) * 60);

  // Calculate geolocations of PKS (Mill) arrival
  // 1 degree is roughly 111 km. Northeast bearing used for displacement
  const latOffset = (distanceKm / 111) * 0.7071;
  const lngOffset = (distanceKm / 111) * 0.7071;

  const createdDate = new Date(batch.created_at);
  let harvestTime: string;
  let weighedTime: string;
  let departureTime: string;
  let arrivalTime: string;
  let gpsStatus: string;
  let validationStatus: string;

  if (isVerified) {
    // Verified: timeline finalized in the past. verifiedTime = createdDate
    const verifiedTimeMs = createdDate.getTime();
    const arrivalTimeMs = verifiedTimeMs - 30 * 60 * 1000; // Arrived 30 mins before verification
    const departureTimeMs = arrivalTimeMs - travelDurationMinutes * 60 * 1000;
    const weighedTimeMs = departureTimeMs - 15 * 60 * 1000;
    const harvestTimeMs = weighedTimeMs - 45 * 60 * 1000;

    harvestTime = new Date(harvestTimeMs).toISOString();
    weighedTime = new Date(weighedTimeMs).toISOString();
    departureTime = new Date(departureTimeMs).toISOString();
    arrivalTime = new Date(arrivalTimeMs).toISOString();
    gpsStatus = 'Active (Locked GPS-Track / Delivered)';
    validationStatus = 'Validated by PODGE Admin + BPDPKS Auditor';
  } else {
    // Pending: createdDate is dispatch submission time. Truck is in transit or awaiting mill verify
    const dispatchTimeMs = createdDate.getTime();
    const departureTimeMs = dispatchTimeMs;
    const weighedTimeMs = departureTimeMs - 15 * 60 * 1000;
    const harvestTimeMs = weighedTimeMs - 45 * 60 * 1000;
    const arrivalTimeMs = departureTimeMs + travelDurationMinutes * 60 * 1000;

    harvestTime = new Date(harvestTimeMs).toISOString();
    weighedTime = new Date(weighedTimeMs).toISOString();
    departureTime = new Date(departureTimeMs).toISOString();
    arrivalTime = new Date(arrivalTimeMs).toISOString();
    gpsStatus = batch.status === 'Tertunda' ? 'Hold (Transit Halted for Investigation)' : 'Active (En Route to Mill)';
    validationStatus = batch.status === 'Tertunda' ? 'Audit Pending Investigation' : 'Menunggu Validasi Dokumen Lahan & Penerimaan PKS';
  }

  // Realistic weights
  const tareWeight = 2000 + (absSeed % 1000); // 2000 - 3000 Kg
  const grossWeight = weight + tareWeight;

  const harvestStepHash = '0x' + crypto.createHash('sha256').update(batch.batch_id + 'step1-harvest').digest('hex');
  const weighStepHash = isVerified 
    ? '0x' + crypto.createHash('sha256').update(batch.batch_id + 'step2-weigh').digest('hex')
    : batch.blockchain_hash;
  const pksStepHash = '0x' + crypto.createHash('sha256').update(batch.batch_id + 'step3-receive').digest('hex');
  const finalStepHash = batch.blockchain_hash;

  const auditTrail = [
    {
      time: harvestTime,
      actor: 'Petani',
      action: 'Harvest photo and land geofence validation submitted',
      previousHash: 'GENESIS',
      entryHash: harvestStepHash,
    },
    {
      time: weighedTime,
      actor: 'Koperasi',
      action: `Volume weighed and cooperative identity validated (${weight.toLocaleString('id-ID')} Kg Net)`,
      previousHash: harvestStepHash,
      entryHash: weighStepHash,
    },
  ];

  if (isVerified) {
    auditTrail.push(
      {
        time: arrivalTime,
        actor: 'PKS',
        action: `TBS delivery arrived, weighed, and accepted at Mill reception`,
        previousHash: weighStepHash,
        entryHash: pksStepHash,
      },
      {
        time: createdDate.toISOString(),
        actor: 'Auditor',
        action: 'ISPO/RSPO compliance documents and geofencing validation finalized',
        previousHash: pksStepHash,
        entryHash: finalStepHash,
      }
    );
  }

  return {
    id: batch.id,
    batch_id: batch.batch_id,
    farmer_name: batch.farmer_name,
    tbs_weight_kg: weight,
    pks_destination: batch.pks_destination,
    blockchain_hash: batch.blockchain_hash,
    status: batch.status,
    created_at: batch.created_at,
    pdfReportUrl: `/verify/${encodeURIComponent(batch.batch_id)}/report.pdf`,
    estate: {
      name: `Kavling Sawit Mandiri - Blok ${String.fromCharCode(65 + (absSeed % 6))}${absSeed % 10}`,
      province: 'Riau',
      district: absSeed % 2 === 0 ? 'Kampar' : 'Siak',
      centroid: { lat, lng },
      polygon,
      areaHa,
    },
    cooperative: {
      name: cooperativeName,
      registrationId: `KOP-RIAU-KPR-${2020 + (absSeed % 7)}-00${10 + (absSeed % 89)}`,
      chairperson: absSeed % 2 === 0 ? 'Bapak Ir. H. Mulyadi' : 'Bapak Slamet Rahardjo',
      validationStatus,
      verifiedAt: weighedTime,
    },
    farmer: {
      name: farmerGroupName,
      memberId: `MEMBER-${100 + (absSeed % 900)}`,
      nationalIdMasked: `1403${absSeed % 9}********00${absSeed % 99}`,
      phoneMasked: `+62 812 **** ${1000 + (absSeed % 8999)}`,
    },
    certifications: [
      {
        scheme: 'ISPO',
        certificateNo: `ISPO/ID-RIAU/2026/0${100 + (absSeed % 899)}`,
        holder: cooperativeName,
        validUntil: '2031-03-20',
        documentUrl: '#',
        status: isVerified ? 'Valid' : 'Pending Verification Review',
      },
    ],
    evidencePhotos: [
      {
        label: 'Foto Bukti Panen',
        url: '/evidence/batch-podge-2100-001-harvest.svg',
        capturedAt: harvestTime,
        geoTag: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        hash: `sha256:${crypto.createHash('sha256').update(batch.batch_id + 'harvest').digest('hex')}`,
      },
      {
        label: 'Foto Bukti Pengiriman',
        url: '/evidence/batch-podge-2100-001-delivery.svg',
        capturedAt: departureTime,
        geoTag: `${(lat + 0.002).toFixed(5)}, ${(lng + 0.002).toFixed(5)}`,
        hash: `sha256:${crypto.createHash('sha256').update(batch.batch_id + 'delivery').digest('hex')}`,
      },
    ],
    roles: [
      { role: 'Petani', actor: farmerGroupName, authority: 'Create harvest evidence', status: 'Signed' },
      { role: 'Koperasi', actor: cooperativeName, authority: 'Validate member and volume', status: 'Signed' },
      { role: 'PKS', actor: batch.pks_destination, authority: 'Receive shipment', status: isVerified ? 'Signed' : 'Pending' },
      { role: 'Auditor', actor: 'BPDPKS Auditor', authority: 'Verify geofence and compliance', status: isVerified ? 'Signed' : 'Pending' },
      { role: 'Admin', actor: 'PODGE Governance Node', authority: 'Lock ledger record', status: isVerified ? 'Signed' : 'Pending' },
    ],
    auditTrail,
    antiFraudChecks: [
      { check: 'Duplicate hash detection', result: 'Pass', detail: 'No matching hash found in active ledger sample.' },
      { 
        check: 'Volume anomaly', 
        result: weight > 7500 ? 'Review' : 'Pass', 
        detail: `${weight.toLocaleString('id-ID')} Kg yield checked against estate historic capacity.` 
      },
      { check: 'Distance sanity', result: 'Pass', detail: `${distanceKm} Km route distance is below 120 Km regional max.` },
      { 
        check: 'Geofence validation', 
        result: isVerified ? 'Pass' : 'Review', 
        detail: 'Harvest evidence coordinates compared with national protected forest geofence polygon.' 
      },
    ],
    logistics: {
      suratJalanNo: `SJ-PODGE-${1000 + (absSeed % 8999)}`,
      invoiceNo: `INV-PODGE-${1000 + (absSeed % 8999)}`,
      truckPlate,
      driverMasked: 'DVR-****-' + (absSeed % 100),
      distanceKm,
      maxDistanceKm: 120,
    },
    tbsDetails: {
      transactionId: `TX-TBS-${1000 + (absSeed % 8999)}`,
      grossWeight,
      tareWeight,
      netWeight: weight,
      quality: absSeed % 2 === 0 ? 'Kelas A (Super)' : 'Kelas B (Standar)',
    },
    transportationDetails: {
      deliveryId: `TR-LOG-${1000 + (absSeed % 8999)}`,
      licensePlate: truckPlate,
      driver: absSeed % 2 === 0 ? 'Supriadi' : 'M. Yusuf',
      departureTime,
      arrivalTime,
      gpsStatus,
    },
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
