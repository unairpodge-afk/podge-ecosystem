'use client';

import { useState } from 'react';
import { 
  Factory, 
  Settings, 
  Globe, 
  CheckCircle2, 
  FileText, 
  Database, 
  TrendingUp, 
  ShieldCheck, 
  Scale, 
  Leaf, 
  Coins,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

// Downstream telemetry data mapped to our 3 case study companies
const downstreamData = [
  {
    company: 'PT Borneo Palm Energy',
    region: 'Kalimantan Tengah',
    step4: {
      idPks: 'PKS-KALTENG-001',
      tanggalTerima: '05 Juni 2026',
      beratNetto: '3.850 Kg',
      rendemen: '22.8%',
      outputCpo: '0.88 Ton'
    },
    step5: {
      idBatchCpo: 'BATCH-CPO-BORNEO-001',
      volume: '0.88 Ton',
      kadarAir: '0.14%',
      ffa: '3.1%',
      tanggalProduksi: '05 Juni 2026'
    },
    step6: {
      idRefinery: 'REF-DUMAI-011',
      inputCpo: '0.88 Ton',
      produkTurunan: 'RBD Palm Olein',
      yield: '79.2%',
      tanggalProduksi: '06 Juni 2026'
    },
    step7: {
      negaraTujuan: 'Rotterdam, Belanda (EU)',
      buyer: 'AarhusKarlshamn (AAK) Sweden',
      volumeEkspor: '0.70 Ton',
      noKontainer: 'MSCU-88210-9',
      billOfLading: 'BL-PODGE-BORNEO-0092'
    }
  },
  {
    company: 'PT Riau Agromakmur',
    region: 'Riau',
    step4: {
      idPks: 'PKS-RIAU-002',
      tanggalTerima: '05 Juni 2026',
      beratNetto: '4.875 Kg',
      rendemen: '23.1%',
      outputCpo: '1.13 Ton'
    },
    step5: {
      idBatchCpo: 'BATCH-CPO-RIAU-001',
      volume: '1.13 Ton',
      kadarAir: '0.15%',
      ffa: '3.2%',
      tanggalProduksi: '05 Juni 2026'
    },
    step6: {
      idRefinery: 'REF-DUMAI-012',
      inputCpo: '1.13 Ton',
      produkTurunan: 'RBD Palm Olein',
      yield: '78.5%',
      tanggalProduksi: '06 Juni 2026'
    },
    step7: {
      negaraTujuan: 'Hamburg, Jerman (EU)',
      buyer: 'Nestlé European Supply',
      volumeEkspor: '0.89 Ton',
      noKontainer: 'MSCU-90218-0',
      billOfLading: 'BL-PODGE-RIAU-0118'
    }
  },
  {
    company: 'PT Sumatera Palm Lestari',
    region: 'Sumatera Utara',
    step4: {
      idPks: 'PKS-SUMUT-003',
      tanggalTerima: '05 Juni 2026',
      beratNetto: '3.120 Kg',
      rendemen: '21.9%',
      outputCpo: '0.68 Ton'
    },
    step5: {
      idBatchCpo: 'BATCH-CPO-SUMUT-001',
      volume: '0.68 Ton',
      kadarAir: '0.16%',
      ffa: '3.4%',
      tanggalProduksi: '05 Juni 2026'
    },
    step6: {
      idRefinery: 'REF-BELAWAN-004',
      inputCpo: '0.68 Ton',
      produkTurunan: 'RBD Palm Olein',
      yield: '77.8%',
      tanggalProduksi: '06 Juni 2026'
    },
    step7: {
      negaraTujuan: 'Genoa, Italia (EU)',
      buyer: 'Ferrero SPA Italy',
      volumeEkspor: '0.53 Ton',
      noKontainer: 'MSCU-11540-2',
      billOfLading: 'BL-PODGE-SUMUT-0115'
    }
  }
];

export default function DownstreamViewer() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const data = downstreamData[selectedIdx];

  return (
    <div className="space-y-8">
      {/* Tab Selector */}
      <div className="glass-panel p-4 rounded-xl border border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Info size={14} className="text-emerald-400" />
            Integrasi Rantai Pasok Hilir (Downstream)
          </h3>
          <p className="text-[11px] text-emerald-200/50 mt-1">Pilih entitas perusahaan untuk memuat visualisasi audit timbangan, CPO tangki, refinery, hingga ekspor.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {downstreamData.map((d, index) => (
            <button
              key={d.company}
              onClick={() => setSelectedIdx(index)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedIdx === index 
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-black/40 text-emerald-300 border border-emerald-900/50 hover:border-emerald-500/30'
              }`}
            >
              {d.company}
            </button>
          ))}
        </div>
      </div>

      {/* Downstream Timeline */}
      <div className="space-y-6 relative">
        {/* Decorative connecting vertical line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500/50 via-yellow-500/40 to-blue-500/50 hidden md:block z-0"></div>

        {/* STEP 4: PKS */}
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/15 relative z-10 hover:border-emerald-500/30 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-6 items-center">
            {/* Left: Info & SVG */}
            <div className="flex gap-4 items-start">
              <div className="h-12 w-12 rounded-xl bg-emerald-500 text-black font-space font-extrabold text-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                4
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-white font-space flex items-center gap-2">
                  PKS (Pabrik Kelapa Sawit)
                </h4>
                <p className="text-xs text-emerald-200/60 leading-relaxed">
                  TBS diterima di PKS, ditimbang ulang dan diolah menjadi Crude Palm Oil (CPO) dan produk samping (inti sawit / cangkang).
                </p>
                {/* SVG Illustration */}
                <div className="h-28 w-full bg-black/40 rounded-lg border border-emerald-950/60 p-2 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 200 120" className="w-full h-full opacity-85">
                    <defs>
                      <linearGradient id="pksGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                    <path d="M20 90 L20 60 L60 40 L60 90 Z" fill="url(#pksGrad)" stroke="#10b981" strokeWidth="1.5"/>
                    <path d="M60 90 L60 50 L120 30 L160 50 L160 90 Z" fill="url(#pksGrad)" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.8"/>
                    <rect x="135" y="15" width="12" height="40" fill="url(#pksGrad)" stroke="#10b981" strokeWidth="1.5"/>
                    <circle cx="141" cy="8" r="6" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2 2"/>
                    <rect x="30" y="70" width="8" height="8" fill="#040806" stroke="#10b981" strokeWidth="1"/>
                    <rect x="45" y="70" width="8" height="8" fill="#040806" stroke="#10b981" strokeWidth="1"/>
                    <rect x="80" y="60" width="10" height="15" fill="#040806" stroke="#10b981" strokeWidth="1"/>
                    <rect x="100" y="60" width="10" height="15" fill="#040806" stroke="#10b981" strokeWidth="1"/>
                    <line x1="10" y1="90" x2="190" y2="90" stroke="#10b981" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle: Metadata/Telemetry */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">PKS Telemetry Log</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">ID PKS:</span>
                  <span className="font-bold text-white font-mono">{data.step4.idPks}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Tanggal Terima:</span>
                  <span className="font-bold text-white">{data.step4.tanggalTerima}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Berat Netto:</span>
                  <span className="font-bold text-white">{data.step4.beratNetto}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Rendemen:</span>
                  <span className="font-bold text-emerald-400">{data.step4.rendemen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200/50">Output CPO:</span>
                  <span className="font-bold text-emerald-400">{data.step4.outputCpo}</span>
                </div>
              </div>
            </div>

            {/* Right: Verified Documents */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Verified Evidence</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                {['e-Fact PKS', 'Laporan Produksi', 'Sertifikat Rendemen', 'QC Result Mill'].map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-emerald-200/80">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 5: CPO */}
        <div className="glass-panel p-6 rounded-xl border border-yellow-500/10 relative z-10 hover:border-yellow-500/30 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-6 items-center">
            {/* Left: Info & SVG */}
            <div className="flex gap-4 items-start">
              <div className="h-12 w-12 rounded-xl bg-yellow-500 text-black font-space font-extrabold text-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                5
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-white font-space flex items-center gap-2">
                  CPO (Crude Palm Oil)
                </h4>
                <p className="text-xs text-emerald-200/60 leading-relaxed">
                  Crude Palm Oil (CPO) disimpan dalam tangki penyimpanan khusus (Bulking Station) sebelum dikirim ke refinery atau pelabuhan.
                </p>
                {/* SVG Illustration */}
                <div className="h-28 w-full bg-black/40 rounded-lg border border-emerald-950/60 p-2 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 200 120" className="w-full h-full opacity-85">
                    <defs>
                      <linearGradient id="tankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.2"/>
                      </linearGradient>
                    </defs>
                    <rect x="25" y="35" width="40" height="55" rx="4" fill="url(#tankGrad)" stroke="#f59e0b" strokeWidth="1.5"/>
                    <ellipse cx="45" cy="35" rx="20" ry="5" fill="#d97706" stroke="#f59e0b" strokeWidth="1.5"/>
                    <rect x="75" y="25" width="50" height="65" rx="5" fill="url(#tankGrad)" stroke="#f59e0b" strokeWidth="2"/>
                    <ellipse cx="100" cy="25" rx="25" ry="6" fill="#d97706" stroke="#f59e0b" strokeWidth="2"/>
                    <path d="M100 45 C103 45 106 48 106 52 C106 56 100 62 100 62 C100 62 94 56 94 52 C94 48 97 45 100 45 Z" fill="#f59e0b"/>
                    <rect x="135" y="35" width="40" height="55" rx="4" fill="url(#tankGrad)" stroke="#f59e0b" strokeWidth="1.5"/>
                    <ellipse cx="155" cy="35" rx="20" ry="5" fill="#d97706" stroke="#f59e0b" strokeWidth="1.5"/>
                    <path d="M10 90 L190 90" stroke="#f59e0b" strokeWidth="2"/>
                    <path d="M45 80 L75 80" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" fill="none"/>
                    <path d="M125 80 L155 80" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle: Metadata/Telemetry */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">CPO Storage Telemetry</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">ID Batch CPO:</span>
                  <span className="font-bold text-white font-mono">{data.step5.idBatchCpo}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Volume CPO:</span>
                  <span className="font-bold text-white">{data.step5.volume}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Kadar Air:</span>
                  <span className="font-bold text-white">{data.step5.kadarAir}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Kadar FFA:</span>
                  <span className="font-bold text-yellow-500">{data.step5.ffa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200/50">Tgl Produksi:</span>
                  <span className="font-bold text-white">{data.step5.tanggalProduksi}</span>
                </div>
              </div>
            </div>

            {/* Right: Verified Documents */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">Verified Evidence</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                {['e-Fact CPO', 'Hasil Uji Lab FFA', 'Tank Storage Log', 'Trace ID Certificate'].map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-emerald-200/80">
                    <CheckCircle2 size={13} className="text-yellow-500 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 6: REFINERY */}
        <div className="glass-panel p-6 rounded-xl border border-cyan-500/10 relative z-10 hover:border-cyan-500/30 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-6 items-center">
            {/* Left: Info & SVG */}
            <div className="flex gap-4 items-start">
              <div className="h-12 w-12 rounded-xl bg-cyan-500 text-black font-space font-extrabold text-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                6
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-white font-space flex items-center gap-2">
                  REFINERY (Pabrik Penyulingan)
                </h4>
                <p className="text-xs text-emerald-200/60 leading-relaxed">
                  CPO diolah menjadi produk turunan pangan atau industri seperti RBD Palm Olein (minyak goreng), Stearin, dan asam lemak bebas.
                </p>
                {/* SVG Illustration */}
                <div className="h-28 w-full bg-black/40 rounded-lg border border-emerald-950/60 p-2 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 200 120" className="w-full h-full opacity-85">
                    <defs>
                      <linearGradient id="refGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                    <rect x="30" y="20" width="14" height="70" fill="url(#refGrad)" stroke="#06b6d4" strokeWidth="1.5"/>
                    <rect x="55" y="10" width="16" height="80" fill="url(#refGrad)" stroke="#06b6d4" strokeWidth="1.5"/>
                    <rect x="85" y="30" width="12" height="60" fill="url(#refGrad)" stroke="#06b6d4" strokeWidth="1.5"/>
                    <rect x="110" y="15" width="18" height="75" fill="url(#refGrad)" stroke="#06b6d4" strokeWidth="1.5"/>
                    <rect x="140" y="25" width="14" height="65" fill="url(#refGrad)" stroke="#06b6d4" strokeWidth="1.5"/>
                    <line x1="55" y1="30" x2="71" y2="30" stroke="#06b6d4" strokeWidth="2"/>
                    <line x1="55" y1="50" x2="71" y2="50" stroke="#06b6d4" strokeWidth="2"/>
                    <line x1="110" y1="35" x2="128" y2="35" stroke="#06b6d4" strokeWidth="2"/>
                    <line x1="110" y1="55" x2="128" y2="55" stroke="#06b6d4" strokeWidth="2"/>
                    <path d="M44 40 L55 40" stroke="#06b6d4" strokeWidth="2" fill="none"/>
                    <path d="M71 60 L85 60" stroke="#06b6d4" strokeWidth="2" fill="none"/>
                    <path d="M97 50 L110 50" stroke="#06b6d4" strokeWidth="2" fill="none"/>
                    <path d="M128 40 L140 40" stroke="#06b6d4" strokeWidth="2" fill="none"/>
                    <line x1="10" y1="90" x2="190" y2="90" stroke="#06b6d4" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle: Metadata/Telemetry */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Refinery Process Log</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">ID Refinery:</span>
                  <span className="font-bold text-white font-mono">{data.step6.idRefinery}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Input CPO (Ton):</span>
                  <span className="font-bold text-white">{data.step6.inputCpo}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Produk Turunan:</span>
                  <span className="font-bold text-white">{data.step6.produkTurunan}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Yield (%):</span>
                  <span className="font-bold text-cyan-400">{data.step6.yield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200/50">Tgl Selesai:</span>
                  <span className="font-bold text-white">{data.step6.tanggalProduksi}</span>
                </div>
              </div>
            </div>

            {/* Right: Verified Documents */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Verified Evidence</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                {['e-Fact Refinery', 'Sertifikat Halal Produk', 'Spesifikasi Mutu', 'Quality Lab Report'].map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-emerald-200/80">
                    <CheckCircle2 size={13} className="text-cyan-500 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 7: EKSPOR */}
        <div className="glass-panel p-6 rounded-xl border border-blue-500/10 relative z-10 hover:border-blue-500/30 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-6 items-center">
            {/* Left: Info & SVG */}
            <div className="flex gap-4 items-start">
              <div className="h-12 w-12 rounded-xl bg-blue-500 text-black font-space font-extrabold text-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                7
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-white font-space flex items-center gap-2">
                  EKSPOR (Shipping & Port)
                </h4>
                <p className="text-xs text-emerald-200/60 leading-relaxed">
                  Produk turunan minyak kelapa sawit dikapalkan menuju pembeli internasional dengan dokumen kepatuhan EUDR lengkap.
                </p>
                {/* SVG Illustration */}
                <div className="h-28 w-full bg-black/40 rounded-lg border border-emerald-950/60 p-2 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 200 120" className="w-full h-full opacity-85">
                    <defs>
                      <linearGradient id="shipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                    <path d="M10 95 Q50 90 90 95 T170 95 Q180 97 190 95" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                    <path d="M10 102 Q40 98 80 102 T160 102" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5"/>
                    <path d="M30 70 L140 70 L155 85 L145 92 L35 92 Z" fill="url(#shipGrad)" stroke="#3b82f6" strokeWidth="1.5"/>
                    <rect x="40" y="55" width="25" height="15" fill="url(#shipGrad)" stroke="#3b82f6" strokeWidth="1"/>
                    <rect x="48" y="47" width="12" height="8" fill="url(#shipGrad)" stroke="#3b82f6" strokeWidth="1"/>
                    <rect x="75" y="60" width="12" height="10" fill="#10b981" stroke="#047857" strokeWidth="1"/>
                    <rect x="87" y="60" width="12" height="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                    <rect x="99" y="60" width="12" height="10" fill="#ef4444" stroke="#b91c1c" strokeWidth="1"/>
                    <rect x="111" y="60" width="12" height="10" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1"/>
                    <rect x="81" y="50" width="12" height="10" fill="#ef4444" stroke="#b91c1c" strokeWidth="1"/>
                    <rect x="93" y="50" width="12" height="10" fill="#10b981" stroke="#047857" strokeWidth="1"/>
                    <rect x="105" y="50" width="12" height="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle: Metadata/Telemetry */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-blue-500 uppercase tracking-widest">Customs & Shipping Log</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Negara Tujuan:</span>
                  <span className="font-bold text-white">{data.step7.negaraTujuan}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Pembeli (Buyer):</span>
                  <span className="font-bold text-white text-[11px]">{data.step7.buyer}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">Volume Ekspor:</span>
                  <span className="font-bold text-white">{data.step7.volumeEkspor}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1">
                  <span className="text-emerald-200/50">No. Kontainer:</span>
                  <span className="font-bold text-white font-mono">{data.step7.noKontainer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200/50">Bill of Lading:</span>
                  <span className="font-bold text-blue-400 font-mono text-[10px]">{data.step7.billOfLading}</span>
                </div>
              </div>
            </div>

            {/* Right: Verified Documents */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-blue-500 uppercase tracking-widest">Verified Evidence</p>
              <div className="bg-black/35 rounded-lg border border-emerald-950 p-3 space-y-2 text-xs">
                {['e-Fact Ekspor', 'Dokumen PEB / BC 3.0', 'Sertifikat Asal (COO)', 'Persetujuan Bea Cukai'].map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-emerald-200/80">
                    <CheckCircle2 size={13} className="text-blue-500 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-white font-space text-center uppercase tracking-wider">
          Manfaat Rantai Pasok Terintegrasi
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Transparansi Data', icon: Database, desc: 'Pelacakan data realtime & enkripsi blockchain.' },
            { label: 'Kepercayaan Meningkat', icon: ShieldCheck, desc: 'Jaminan audit transparan bagi pembeli.' },
            { label: 'Kepatuhan Regulasi', icon: FileText, desc: 'Lolos uji regulasi ISPO, RSPO, & EUDR.' },
            { label: 'Akses Pasar Global', icon: Globe, desc: 'Ekspor langsung ke pasar Eropa & Amerika.' },
            { label: 'Keberlanjutan', icon: Leaf, desc: 'Bebas deforestasi & reduksi emisi karbon.' },
            { label: 'Kesejahteraan Petani', icon: Coins, desc: 'Incentive hijau & harga beli premium.' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-4 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 transition text-center flex flex-col items-center justify-between space-y-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-space leading-snug">{item.label}</h4>
                  <p className="text-[9px] text-emerald-200/50 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
