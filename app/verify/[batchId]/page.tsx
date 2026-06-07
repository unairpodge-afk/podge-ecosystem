import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import {
  BadgeCheck,
  Camera,
  ClipboardCheck,
  Download,
  Factory,
  FileCheck2,
  Fingerprint,
  Leaf,
  MapPinned,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Timer,
  Users,
  Scale,
  Truck,
} from 'lucide-react';
import { getBatchPassport, getTrustScore } from '@/lib/batch-passport';

export const dynamic = 'force-dynamic';

function getStatusClass(status: string) {
  if (status === 'Terverifikasi') {
    return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300';
  }

  if (status === 'Dalam Proses') {
    return 'border-lime-400/40 bg-lime-500/15 text-lime-300';
  }

  return 'border-yellow-400/40 bg-yellow-500/15 text-yellow-300';
}

export async function generateMetadata({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const decodedBatchId = decodeURIComponent(batchId);

  return {
    title: `${decodedBatchId} | PODGE Batch Passport`,
    description: `Public verification passport for traceability batch ${decodedBatchId}.`,
  };
}

export default async function BatchPassportPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const decodedBatchId = decodeURIComponent(batchId);
  const batch = await getBatchPassport(decodedBatchId);

  if (!batch) {
    notFound();
  }

  const trustScore = getTrustScore(batch);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://podge-ecosystem.vercel.app';
  const verificationUrl = `${siteUrl}/verify/${encodeURIComponent(batch.batch_id)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <main className="min-h-screen bg-[#040806] text-emerald-50 web3-grid">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/60 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-lg font-extrabold text-black shadow-[0_0_22px_rgba(16,185,129,0.45)]">
              P
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-wider text-emerald-50 font-space">PODGE</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Batch Digital Passport</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(batch.status)}`}>
              {batch.status}
            </span>
            <a
              href={batch.pdfReportUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400"
            >
              <Download size={16} />
              Export PDF
            </a>
            <Link
              href="/governance/traceability"
              className="rounded-lg border border-emerald-700/50 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-950/60"
            >
              Back to Ledger
            </Link>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 py-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="glass-panel rounded-lg p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                <ShieldCheck size={13} />
                Public Verification Record
              </div>
              <h1 className="mt-5 break-words text-4xl font-extrabold text-emerald-50 font-space md:text-6xl">
                {batch.batch_id}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-emerald-200/65">
                Integrated accountable batch record with land polygon, validated cooperative identity,
                ISPO/RSPO documents, evidence photos, role signatures, immutable audit trail, QR verification,
                and anti-fraud checks.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <MetricCard icon={Leaf} label="Origin" value={batch.farmer_name} note="Validated farmer/cooperative" />
                <MetricCard icon={PackageCheck} label="Volume" value={`${Number(batch.tbs_weight_kg).toLocaleString('id-ID')} Kg`} note="Fresh fruit bunches" />
                <MetricCard icon={Factory} label="Destination" value={batch.pks_destination} note="Palm oil mill target" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className="glass-panel rounded-lg p-6">
                <SectionTitle icon={MapPinned} label="Geolocation / Polygon Lahan" title={batch.estate.name} />
                <div className="mt-4 rounded-lg border border-emerald-900/70 bg-black/30 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Info label="Provinsi" value={batch.estate.province} />
                    <Info label="Kabupaten" value={batch.estate.district} />
                    <Info label="Centroid" value={`${batch.estate.centroid.lat}, ${batch.estate.centroid.lng}`} />
                    <Info label="Area" value={`${batch.estate.areaHa} Ha`} />
                  </div>
                  <div className="mt-4 rounded-lg border border-emerald-900/70 bg-[#020604] p-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Polygon Coordinates</p>
                    <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-emerald-200/65">
                      {batch.estate.polygon.map((point) => `${point.lat}, ${point.lng}`).join('\n')}
                    </pre>
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-lg p-6">
                <SectionTitle icon={Users} label="Identitas Tervalidasi" title={batch.cooperative.name} />
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                  <Info label="Registration ID" value={batch.cooperative.registrationId} />
                  <Info label="Ketua Koperasi" value={batch.cooperative.chairperson} />
                  <Info label="Petani / Grup" value={`${batch.farmer.name} (${batch.farmer.memberId})`} />
                  <Info label="Validasi" value={batch.cooperative.validationStatus} />
                </div>
              </section>
            </div>

            {/* Step 2 & Step 3: FFB (TBS) Weighing and Transportation Tracing */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Step 2: TBS Weighing & Quality Check */}
              <section className="glass-panel rounded-lg p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <SectionTitle icon={Scale} label="Step 02: Timbangan TBS" title="FFB Weighing & Quality" />
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 font-mono">
                    {batch.tbsDetails.transactionId}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/60 leading-relaxed mb-4">
                  Tandan Buah Segar (TBS) ditimbang secara digital menggunakan timbangan jembatan otomatis terkalibrasi sebelum pengiriman ke Pabrik Kelapa Sawit (PKS) Aura.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <Info label="Berat Bruto (Gross)" value={`${Number(batch.tbsDetails.grossWeight).toLocaleString('id-ID')} Kg`} />
                  <Info label="Berat Tara (Truck)" value={`${Number(batch.tbsDetails.tareWeight).toLocaleString('id-ID')} Kg`} />
                  <div className="col-span-2">
                    <Info label="Berat Netto (TBS)" value={`${Number(batch.tbsDetails.netWeight).toLocaleString('id-ID')} Kg`} />
                  </div>
                  <div className="col-span-2">
                    <Info label="Kualitas & Grading TBS" value={batch.tbsDetails.quality} />
                  </div>
                </div>
                
                {/* Documents / Verification Evidence */}
                <div className="border-t border-emerald-950 pt-3 space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Validated Harvest Evidence Documents</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'e-Fact Panen', valid: true },
                      { name: 'Bukti Timbang', valid: true },
                      { name: 'Kualitas TBS', valid: true },
                      { name: 'Foto Hasil Panen', valid: true },
                    ].map(doc => (
                      <div key={doc.name} className="flex items-center gap-1.5 text-xs text-emerald-200/80">
                        <BadgeCheck size={13} className="text-emerald-400 shrink-0" />
                        <span>{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Step 3: Transportation & Logistics */}
              <section className="glass-panel rounded-lg p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <SectionTitle icon={Truck} label="Step 03: Transportasi" title="Logistics & GPS Tracking" />
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 font-mono">
                    {batch.transportationDetails.deliveryId}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/60 leading-relaxed mb-4">
                  TBS diangkut menggunakan armada logistik terdaftar dengan pengawasan geofencing aktif dan pencatatan GPS untuk jaminan bebas deforestasi (anti-fraud).
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <Info label="No. Polisi Armada" value={batch.transportationDetails.licensePlate} />
                  <Info label="Nama Pengemudi (Supir)" value={batch.transportationDetails.driver} />
                  <Info label="Waktu Berangkat (Out)" value={new Date(batch.transportationDetails.departureTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + ' WIB'} />
                  <Info
                    label={batch.status === 'Terverifikasi' ? "Waktu Tiba (In Mill)" : "Estimasi Tiba (In Mill)"}
                    value={
                      new Date(batch.transportationDetails.arrivalTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + ' WIB' +
                      (batch.status === 'Terverifikasi' 
                        ? '' 
                        : batch.status === 'Tertunda'
                          ? ' (Tertunda)'
                          : ' (Estimasi)'
                      )
                    }
                  />
                  <div className="col-span-2">
                    <Info label="Status GPS Realtime" value={batch.transportationDetails.gpsStatus} />
                  </div>
                </div>

                {/* Logistics Documents */}
                <div className="border-t border-emerald-950 pt-3 space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Validated Dispatch Verification</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'e-Fact Pengiriman', valid: true },
                      { name: 'GPS Telemetry Log', valid: true },
                      { name: 'Foto Muatan Truk', valid: true },
                      { name: 'Waktu Tiba PKS', valid: batch.status === 'Terverifikasi' },
                    ].map(doc => (
                      <div key={doc.name} className="flex items-center gap-1.5 text-xs text-emerald-200/80">
                        {doc.valid ? (
                          <BadgeCheck size={13} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Timer size={13} className="text-yellow-500 shrink-0 animate-pulse" />
                        )}
                        <span className={doc.valid ? '' : 'text-emerald-200/40 font-mono text-[10px] uppercase'}>
                          {doc.name} {doc.valid ? '' : '(Awaiting)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <section className="glass-panel rounded-lg p-6">
              <SectionTitle icon={FileCheck2} label="Dokumen ISPO / RSPO" title="Certification Evidence" />
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {batch.certifications.map((cert) => (
                  <div key={cert.certificateNo} className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-extrabold text-emerald-50 font-space">{cert.scheme}</p>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                        {cert.status}
                      </span>
                    </div>
                    <Info label="Certificate No" value={cert.certificateNo} />
                    <Info label="Holder" value={cert.holder} />
                    <Info label="Valid Until" value={new Date(cert.validUntil).toLocaleDateString('id-ID')} />
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-lg p-6">
              <SectionTitle icon={Camera} label="Foto Bukti" title="Panen dan Pengiriman" />
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {batch.evidencePhotos.map((photo) => (
                  <div key={photo.hash} className="overflow-hidden rounded-lg border border-emerald-900/70 bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={photo.label} className="h-48 w-full object-cover" />
                    <div className="p-4">
                      <p className="font-bold text-emerald-50">{photo.label}</p>
                      <p className="mt-1 text-xs text-emerald-200/50">{new Date(photo.capturedAt).toLocaleString('id-ID')} | {photo.geoTag}</p>
                      <p className="mt-3 break-all font-mono text-[11px] text-emerald-300/70">{photo.hash}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-lg p-6">
              <SectionTitle icon={ClipboardCheck} label="Audit Trail" title="Immutable Role Signatures" />
              <div className="mt-4 space-y-3">
                {batch.auditTrail.map((entry, index) => (
                  <div key={entry.entryHash} className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-bold text-emerald-50">0{index + 1}. {entry.action}</p>
                      <span className="text-[10px] font-mono text-emerald-400">{entry.actor}</span>
                    </div>
                    <p className="mt-2 text-xs text-emerald-200/50">{new Date(entry.time).toLocaleString('id-ID')}</p>
                    <p className="mt-3 break-all font-mono text-[11px] text-emerald-200/60">prev: {entry.previousHash}</p>
                    <p className="mt-1 break-all font-mono text-[11px] text-emerald-300/75">hash: {entry.entryHash}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="glass-panel rounded-lg p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-500 text-black shadow-[0_0_22px_rgba(16,185,129,0.35)]">
                <BadgeCheck size={28} />
              </div>
              <p className="mt-5 text-[10px] font-mono uppercase tracking-widest text-emerald-400">Trust Score</p>
              <p className="mt-2 text-6xl font-extrabold text-emerald-50 font-space">{trustScore}</p>
              <p className="text-sm text-emerald-200/55">out of 100</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-emerald-950">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${trustScore}%` }} />
              </div>
            </div>

            <div className="glass-panel rounded-lg p-6">
              <div className="flex items-center gap-2 text-emerald-300">
                <QrCode size={17} />
                <p className="text-[10px] font-mono uppercase tracking-widest">QR Surat Jalan / Invoice</p>
              </div>
              <div className="mt-5 rounded-lg border border-emerald-900/70 bg-emerald-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt={`QR verification for ${batch.batch_id}`} className="mx-auto h-52 w-52" />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Info label="Surat Jalan" value={batch.logistics.suratJalanNo} />
                <Info label="Invoice" value={batch.logistics.invoiceNo} />
                <Info label="Truck" value={batch.logistics.truckPlate} />
              </div>
            </div>

            <div className="glass-panel rounded-lg p-6">
              <SectionTitle icon={ShieldCheck} label="Anti-Fraud Validation" title="Data Integrity Checks" />
              <div className="mt-4 space-y-2">
                {batch.antiFraudChecks.map((check) => (
                  <div key={check.check} className="rounded-lg border border-emerald-900/70 bg-black/30 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-emerald-50">{check.check}</p>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        {check.result}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-emerald-200/55">{check.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-lg p-6">
              <SectionTitle icon={Users} label="Role User" title="Access & Responsibility" />
              <div className="mt-4 space-y-2">
                {batch.roles.map((role) => (
                  <div key={role.role} className="rounded-lg border border-emerald-900/70 bg-black/30 p-3">
                    <p className="text-sm font-bold text-emerald-50">{role.role}</p>
                    <p className="text-xs text-emerald-200/55">{role.actor}</p>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">{role.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-lg p-6">
              <div className="flex items-center gap-2 text-emerald-300">
                <Timer size={17} />
                <p className="text-[10px] font-mono uppercase tracking-widest">Timestamp</p>
              </div>
              <p className="mt-3 text-lg font-bold text-emerald-50">
                {new Date(batch.created_at).toLocaleString('id-ID')}
              </p>
              <p className="mt-4 break-all rounded-lg border border-emerald-900/70 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-emerald-200/60">
                {verificationUrl}
              </p>
            </div>

            <div className="glass-panel rounded-lg p-6">
              <div className="flex items-center gap-2 text-emerald-300">
                <Fingerprint size={17} />
                <p className="text-[10px] font-mono uppercase tracking-widest">Blockchain Hash</p>
              </div>
              <p className="mt-4 break-all font-mono text-xs leading-relaxed text-emerald-200/75">
                {batch.blockchain_hash}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({
  icon: Icon,
  label,
  title,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-emerald-300">
        <Icon size={17} />
        <p className="text-[10px] font-mono uppercase tracking-widest">{label}</p>
      </div>
      <h2 className="mt-2 text-xl font-bold text-emerald-50 font-space">{title}</h2>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-emerald-300">
        <Icon size={16} />
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-3 text-base font-bold text-emerald-50">{value}</p>
      <p className="text-xs text-emerald-200/45">{note}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-900/60 bg-black/20 px-3 py-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-emerald-50">{value}</p>
    </div>
  );
}
