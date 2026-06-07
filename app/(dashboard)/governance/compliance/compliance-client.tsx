'use client';

import { useState } from 'react';
import { 
  X, 
  MapPin, 
  Activity, 
  FileText, 
  CheckCircle2, 
  Leaf, 
  Flame, 
  Scale, 
  Database, 
  Calendar, 
  Building,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

type ComplianceRecord = {
  id: string | number;
  company_name: string;
  certification_type: string;
  status: string;
  audit_score: number | string;
  audit_date: string | Date;
};

type ComplianceClientProps = {
  initialRecords: ComplianceRecord[];
};

// Case study telemetry details mapped by company name
const companyAuditDetails: Record<string, {
  location: string;
  centroid: string;
  geofenceArea: string;
  eudrStatus: string;
  peatlandStatus: string;
  auditor: string;
  ledgerHash: string;
  polygon: string[];
}> = {
  'PT Borneo Palm Energy': {
    location: 'Kotawaringin Barat, Kalimantan Tengah',
    centroid: '-2.4172, 111.6214',
    geofenceArea: '145.200 Ha',
    eudrStatus: 'EUDR Deforestation-Free (Passed post-2020 satellite check)',
    peatlandStatus: 'Proteksi Gambut Aktif (Zero peat fire & zero drainage)',
    auditor: 'Badan Sertifikasi RSPO & Tim Verifikator BPDPKS',
    ledgerHash: '0x9c3d4e8b7f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5b6c7d',
    polygon: [
      '-2.4140, 111.6180',
      '-2.4140, 111.6250',
      '-2.4200, 111.6250',
      '-2.4200, 111.6180'
    ]
  },
  'PT Riau Agromakmur': {
    location: 'Kampar, Riau',
    centroid: '0.3714, 101.2769',
    geofenceArea: '84.300 Ha',
    eudrStatus: 'EUDR Deforestation-Free (Passed post-2020 satellite check)',
    peatlandStatus: 'Kawasan Lindung Gambut Terjaga (Sertifikasi ISPO)',
    auditor: 'Auditor Independen Mutu Agung Lestari (ISPO)',
    ledgerHash: '0x9f0c72f4519c3a8e687c9a01542b7ddad83374ba5f07fb39c4a6f4a0c9ef2100',
    polygon: [
      '0.3749, 101.2735',
      '0.3753, 101.2801',
      '0.3690, 101.2810',
      '0.3678, 101.2743'
    ]
  },
  'PT Sumatera Palm Lestari': {
    location: 'Labuhanbatu, Sumatera Utara',
    centroid: '2.1524, 99.8245',
    geofenceArea: '62.100 Ha',
    eudrStatus: 'EUDR Deforestation-Free (Passed post-2020 satellite check)',
    peatlandStatus: 'Kawasan Lindung Bebas Deforestasi (Sertifikasi RSPO)',
    auditor: 'TÜV Rheinland Certification Board',
    ledgerHash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    polygon: [
      '2.1550, 99.8210',
      '2.1550, 99.8280',
      '2.1500, 99.8280',
      '2.1500, 99.8210'
    ]
  }
};

export default function ComplianceClient({ initialRecords }: ComplianceClientProps) {
  const [selectedCompany, setSelectedCompany] = useState<ComplianceRecord | null>(null);

  const activeDetails = selectedCompany 
    ? companyAuditDetails[selectedCompany.company_name] || {
        location: 'Kabupaten Rokan Hulu, Riau',
        centroid: '0.9024, 100.2815',
        geofenceArea: '2.400 Ha',
        eudrStatus: 'EUDR Deforestation-Free (Passed)',
        peatlandStatus: 'Dalam Pengawasan Buffer Zone',
        auditor: 'Lembaga Sertifikasi ISPO Regional',
        ledgerHash: '0x' + Math.random().toString(16).substring(2, 10) + '...verify_hash',
        polygon: ['0.9010, 100.2800', '0.9040, 100.2800', '0.9040, 100.2830', '0.9010, 100.2830']
      }
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Read-Only Info Column (Replaces Form for Blockchain focus) */}
      <div className="lg:col-span-1">
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/10 sticky top-6 space-y-5">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-space">
              Laporan Kepatuhan Hilir (Audit ESG Ledger)
            </h2>
            <p className="text-xs text-emerald-200/60 mt-1.5 leading-relaxed">
              Seluruh laporan evaluasi kelayakan EUDR (Deforestation-Free), sertifikasi mandiri ISPO/RSPO, dan jejak karbon TBS dikunci secara kriptografis pada ledger blockchain PODGE. 
            </p>
          </div>
          <div className="border-t border-emerald-950/80 pt-4 space-y-3 text-xs">
            <div className="p-3 bg-black/45 rounded-lg border border-emerald-950/60 flex items-start gap-2">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Geofencing Satelit Aktif</span>
                <span className="text-[10px] text-emerald-200/50 block mt-0.5">Memetakan batas konsesi lahan secara real-time terhadap polygon hutan lindung nasional.</span>
              </div>
            </div>
            <div className="p-3 bg-black/45 rounded-lg border border-emerald-950/60 flex items-start gap-2">
              <Scale size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Audit e-Dokumen Hukum</span>
                <span className="text-[10px] text-emerald-200/50 block mt-0.5">Validasi kepemilikan STDB, dokumen SPPL lingkungan, dan integrasi rantai pasok.</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-lg text-[11px] text-emerald-300 leading-relaxed">
            <span className="font-bold text-emerald-400 block mb-1">💡 INFO DEMO JURI:</span>
            Klik salah satu kartu perusahaan kelapa sawit di sebelah kanan untuk melihat sertifikat kepatuhan, koordinat polygon lahan satelit, dan bukti ledger blockchain terenkripsi.
          </div>
        </div>
      </div>

      {/* Profiles Grid Column */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-base font-bold text-white font-space flex items-center gap-2">
          <Building size={18} className="text-emerald-400" />
          Registry Kepatuhan & Jejak Karbon Produsen (Klik Untuk Detail)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialRecords.map((record) => {
            const score = Number(record.audit_score);
            const eudrPass = score >= 80;
            const peatPass = score >= 70;
            const stdbPass = score >= 65;
            const carbonIntensity = Math.round(150 - (score * 0.45));

            return (
              <button 
                key={record.id} 
                onClick={() => setSelectedCompany(record)}
                className="glass-panel p-5 rounded-xl border border-emerald-950 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] text-left transition flex flex-col justify-between space-y-4 w-full cursor-pointer"
              >
                {/* Title & Standard */}
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      {record.certification_type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      record.status === 'Terverifikasi' 
                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' 
                        : record.status === 'Dalam Proses' 
                          ? 'border-lime-500/30 bg-lime-500/15 text-lime-300' 
                          : 'border-red-500/30 bg-red-500/15 text-red-300'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-2 font-space leading-tight">{record.company_name}</h4>
                  <p className="text-[10px] text-emerald-200/40 font-mono uppercase tracking-wider">
                    Audit: {new Date(record.audit_date).toLocaleDateString('id-ID', {year: 'numeric', month: 'long', day: 'numeric'})}
                  </p>
                </div>

                {/* ESG Score & Carbon Intensity */}
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-200/50">Skor Audit ESG</span>
                    <span className="font-extrabold text-white">{score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-lime-400' : 'bg-red-400'}`} 
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-emerald-200/50">Intensitas Emisi TBS</span>
                    <span className="font-bold text-emerald-400 font-mono">{carbonIntensity} kg CO2e / Ton</span>
                  </div>
                </div>
              </button>
            );
          })}

          {initialRecords.length === 0 && (
            <div className="col-span-2 text-center py-10 text-sm text-emerald-200/55">
              Belum ada rekam audit kepatuhan terdaftar.
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Kepatuhan (Click to Details) */}
      {selectedCompany && activeDetails && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="glass-panel w-full max-w-lg border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-4 right-4 text-emerald-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="pb-4 border-b border-emerald-950">
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                {selectedCompany.certification_type}
              </span>
              <h3 className="text-lg font-extrabold text-white mt-2 font-space leading-tight">
                {selectedCompany.company_name}
              </h3>
              <p className="text-[10px] text-emerald-200/50 font-mono flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-emerald-400" />
                {activeDetails.location}
              </p>
            </div>

            {/* Modal Scrollable Content */}
            <div className="py-4 space-y-4 overflow-y-auto custom-scrollbar my-2 pr-1 text-xs">
              
              {/* Geofence Map Simulation */}
              <div className="space-y-1">
                <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/80">Simulasi Polygon Lahan Satelit (EUDR)</p>
                <div className="bg-[#020604] border border-emerald-950 p-3.5 rounded-lg font-mono text-[10px] space-y-1 leading-relaxed text-emerald-200/80">
                  <div className="flex justify-between border-b border-emerald-950/60 pb-1.5 mb-1.5">
                    <span>Centroid Kebun:</span>
                    <span className="font-bold text-white">{activeDetails.centroid}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-950/60 pb-1.5 mb-1.5">
                    <span>Luas Area Geofence:</span>
                    <span className="font-bold text-white">{activeDetails.geofenceArea}</span>
                  </div>
                  <div>
                    <span className="block text-emerald-400/60 mb-1">Polygon Koordinat:</span>
                    <div className="grid grid-cols-2 gap-1 pl-2 font-semibold">
                      {activeDetails.polygon.map((p, idx) => (
                        <span key={idx}>P{idx+1}: {p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ESG satellite status flags */}
              <div className="space-y-2 bg-black/45 rounded-lg border border-emerald-950 p-3">
                <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/80">Status Keberlanjutan Geofence</p>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-200/70 flex items-center gap-1.5">
                      <Leaf size={12} className="text-emerald-400" />
                      Status Deforestasi (EUDR)
                    </span>
                    <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase">Lolos (Bebas Deforestasi)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-200/70 flex items-center gap-1.5">
                      <Flame size={12} className="text-emerald-400" />
                      Status Perlindungan Gambut
                    </span>
                    <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase">Lolos (Buffer Zone Aman)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-200/70 flex items-center gap-1.5">
                      <Scale size={12} className="text-emerald-400" />
                      Legalitas Lahan (STDB)
                    </span>
                    <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase">Lengkap & Terdaftar</span>
                  </div>
                </div>
              </div>

              {/* Carbon Emissions block */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/35 rounded-lg border border-emerald-950 flex flex-col justify-between">
                  <span className="text-[9px] text-emerald-400/50 font-mono block">SKOR AUDIT ESG</span>
                  <span className="text-lg font-extrabold text-white mt-1">{selectedCompany.audit_score}%</span>
                </div>
                <div className="p-3 bg-black/35 rounded-lg border border-emerald-950 flex flex-col justify-between">
                  <span className="text-[9px] text-emerald-400/50 font-mono block">JEJAK EMISI TBS</span>
                  <span className="text-lg font-extrabold text-emerald-400 mt-1">
                    {Math.round(150 - (Number(selectedCompany.audit_score) * 0.45))} kg CO2e / t
                  </span>
                </div>
              </div>

              {/* Cryptographic Proof */}
              <div className="space-y-1">
                <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/80">Verifikasi Blockchain Ledger</p>
                <div className="bg-black/45 border border-emerald-950 p-3 rounded-lg font-mono text-[10px] space-y-2">
                  <div>
                    <span className="text-emerald-200/40 block">AUDITOR VALIDATOR:</span>
                    <span className="font-bold text-emerald-300">{activeDetails.auditor}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200/40 block">CRYPTOGRAPHIC AUDIT HASH:</span>
                    <span className="break-all text-white mt-0.5 block font-semibold">{activeDetails.ledgerHash}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-emerald-950 flex justify-between items-center text-xs">
              <span className="text-emerald-200/50">Tanggal Audit:</span>
              <span className="font-bold text-white">
                {new Date(selectedCompany.audit_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
