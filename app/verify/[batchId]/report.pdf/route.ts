import { getBatchPassport, getTrustScore, hashReportPayload } from '@/lib/batch-passport';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function pdfEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapLine(line: string, max = 92) {
  const words = line.split(' ');
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function buildPdf(lines: string[]) {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 42;
  const lineHeight = 14;
  const pageCapacity = 51;
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += pageCapacity) {
    pages.push(lines.slice(index, index + pageCapacity));
  }

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = 3 + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R /F2 ${4 + pages.length * 2} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);

    const text = [
      'BT',
      '/F1 18 Tf',
      `${marginX} ${pageHeight - 48} Td`,
      `(PODGE Batch Digital Passport Report) Tj`,
      '/F2 9 Tf',
      `0 -24 Td`,
      ...pageLines.flatMap((line) => [
        `(${pdfEscape(line)}) Tj`,
        `0 -${lineHeight} Td`,
      ]),
      'ET',
    ].join('\n');

    objects.push(`<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`);
  });

  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

export async function GET(_request: Request, { params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const decodedBatchId = decodeURIComponent(batchId);
  const batch = await getBatchPassport(decodedBatchId);

  if (!batch) {
    return new Response('Batch not found', { status: 404 });
  }

  const reportHash = hashReportPayload(batch);
  const lines = [
    `Batch ID: ${batch.batch_id}`,
    `Status: ${batch.status}`,
    `Trust Score: ${getTrustScore(batch)}/100`,
    `Generated At: ${new Date().toISOString()}`,
    `Report Integrity Hash: sha256:${reportHash}`,
    '',
    '1. TRACEABILITY SUMMARY',
    `Origin: ${batch.farmer_name}`,
    `Volume: ${Number(batch.tbs_weight_kg).toLocaleString('id-ID')} Kg TBS`,
    `Destination: ${batch.pks_destination}`,
    `Ledger Timestamp: ${new Date(batch.created_at).toISOString()}`,
    `Blockchain Hash: ${batch.blockchain_hash}`,
    '',
    '2. GEOLOCATION / POLYGON LAHAN',
    `Estate: ${batch.estate.name}`,
    `Province/District: ${batch.estate.province} / ${batch.estate.district}`,
    `Centroid: ${batch.estate.centroid.lat}, ${batch.estate.centroid.lng}`,
    `Area: ${batch.estate.areaHa} Ha`,
    ...batch.estate.polygon.map((point, index) => `Polygon Point ${index + 1}: ${point.lat}, ${point.lng}`),
    '',
    '3. VALIDATED FARMER / COOPERATIVE IDENTITY',
    `Cooperative: ${batch.cooperative.name}`,
    `Registration ID: ${batch.cooperative.registrationId}`,
    `Chairperson: ${batch.cooperative.chairperson}`,
    `Validation: ${batch.cooperative.validationStatus}`,
    `Farmer Group: ${batch.farmer.name} / ${batch.farmer.memberId}`,
    '',
    '4. ISPO / RSPO DOCUMENTS',
    ...batch.certifications.flatMap((cert) => [
      `${cert.scheme}: ${cert.certificateNo}`,
      `Holder: ${cert.holder}`,
      `Valid Until: ${cert.validUntil}`,
      `Status: ${cert.status}`,
    ]),
    '',
    '5. EVIDENCE PHOTOS',
    ...batch.evidencePhotos.flatMap((photo) => [
      `${photo.label}: ${photo.url}`,
      `Captured At: ${photo.capturedAt}`,
      `GeoTag: ${photo.geoTag}`,
      `Evidence Hash: ${photo.hash}`,
    ]),
    '',
    '6. ROLE SIGNATURES',
    ...batch.roles.map((role) => `${role.role}: ${role.actor} | ${role.authority} | ${role.status}`),
    '',
    '7. IMMUTABLE AUDIT TRAIL',
    ...batch.auditTrail.flatMap((entry, index) => [
      `${index + 1}. ${entry.time} | ${entry.actor} | ${entry.action}`,
      `Previous Hash: ${entry.previousHash}`,
      `Entry Hash: ${entry.entryHash}`,
    ]),
    '',
    '8. QR SURAT JALAN / INVOICE',
    `Surat Jalan: ${batch.logistics.suratJalanNo}`,
    `Invoice: ${batch.logistics.invoiceNo}`,
    `Truck Plate: ${batch.logistics.truckPlate}`,
    `Driver: ${batch.logistics.driverMasked}`,
    `Distance: ${batch.logistics.distanceKm} Km / Max ${batch.logistics.maxDistanceKm} Km`,
    '',
    '9. ANTI-FRAUD VALIDATION',
    ...batch.antiFraudChecks.map((check) => `${check.result}: ${check.check} - ${check.detail}`),
  ].flatMap((line) => wrapLine(line));

  const pdf = buildPdf(lines);

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${batch.batch_id}-accountable-report.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
