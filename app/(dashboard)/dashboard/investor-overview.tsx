'use client';

import { useState } from 'react';
import { 
  Coins, 
  Leaf, 
  TrendingUp, 
  Calculator, 
  Calendar, 
  ShieldCheck, 
  Percent, 
  Activity, 
  Award, 
  Info,
  ArrowRight
} from 'lucide-react';

export default function InvestorOverview() {
  const [investmentAmt, setInvestmentAmt] = useState<number>(50000000); // Default 50 Million IDR
  const [projectType, setProjectType] = useState<'biogas' | 'replanting' | 'compost'>('biogas');

  // Calculates ROI and Carbon Offset based on slider value
  const getCalculation = () => {
    let roiRate = 0.082; // 8.2%
    let carbonMultiplier = 0.35; // 0.35 tCO2e per Million IDR
    let projectTitle = '';

    if (projectType === 'biogas') {
      roiRate = 0.082;
      carbonMultiplier = 0.375;
      projectTitle = 'Biogas POME Methane Capture';
    } else if (projectType === 'replanting') {
      roiRate = 0.075;
      carbonMultiplier = 0.34;
      projectTitle = 'Peremajaan Sawit Rakyat (Replanting)';
    } else {
      roiRate = 0.068;
      carbonMultiplier = 0.275;
      projectTitle = 'Composting & Organic Fertilizer';
    }

    const annualPayout = investmentAmt * roiRate;
    const carbonOffset = (investmentAmt / 1000000) * carbonMultiplier;

    return {
      roiRate: (roiRate * 100).toFixed(1) + '%',
      annualPayout: 'Rp ' + Math.round(annualPayout).toLocaleString('id-ID'),
      carbonOffset: Math.round(carbonOffset).toLocaleString('id-ID') + ' tCO2e',
      projectTitle
    };
  };

  const calc = getCalculation();

  return (
    <div className="space-y-8">
      {/* SECTION 1: INVESTOR PORTOFOLIO PERFORMANCE DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Dividen & Nisbah */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/15 bg-black/45 hover:border-amber-500/35 transition flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">IMBAL HASIL DITERIMA</span>
              <h4 className="text-2xl font-extrabold text-white font-space">Rp 9,840,000</h4>
              <p className="text-xs text-emerald-200/50 mt-1">Total dividen nishbah terbayar otomatis via ledger</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Coins size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-200/40">Rata-rata Nisbah:</span>
            <span className="font-bold text-amber-400 font-mono">7.85% p.a.</span>
          </div>
        </div>

        {/* Card 2: Carbon Offsets Accumulated */}
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/15 bg-black/45 hover:border-emerald-500/35 transition flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">KREDIT KARBON ANDA</span>
              <h4 className="text-2xl font-extrabold text-white font-space">43.8 tCO2e</h4>
              <p className="text-xs text-emerald-200/50 mt-1">Klaim offset karbon tersertifikasi atas investasi Anda</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Leaf size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-200/40">Sertifikat Karbon:</span>
            <span className="font-bold text-emerald-400 font-mono">2 E-Sertifikat Aktif</span>
          </div>
        </div>

        {/* Card 3: Next Payout Date */}
        <div className="glass-panel p-6 rounded-xl border border-blue-500/15 bg-black/45 hover:border-blue-500/35 transition flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">PEMBAYARAN TERDEKAT</span>
              <h4 className="text-2xl font-extrabold text-white font-space">15 Juli 2026</h4>
              <p className="text-xs text-emerald-200/55 mt-1">Jadwal pembagian kupon nisbah Green Sukuk periode berikutnya</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-200/40">Status Pembayaran:</span>
            <span className="font-bold text-blue-400 font-mono">Siap Disalurkan</span>
          </div>
        </div>

      </div>

      {/* SECTION 2: GRID OF CALCULATOR AND PROJECT TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: ROI & Carbon Calculator */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-black/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Calculator size={16} />
              </div>
              <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider">
                Simulasi Profit & Dampak Hijau
              </h4>
            </div>
            
            <p className="text-xs text-emerald-200/60 leading-relaxed">
              Pilih tipe proyek dan geser nilai investasi untuk mensimulasikan bagi hasil syariah serta estimasi kredit karbon tahunan Anda.
            </p>

            {/* Project Select Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/50 rounded-xl border border-emerald-950/60">
              {[
                { key: 'biogas', label: 'Biogas' },
                { key: 'replanting', label: 'Replanting' },
                { key: 'compost', label: 'Composting' }
              ].map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setProjectType(p.key as any)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold font-space transition-all cursor-pointer ${
                    projectType === p.key 
                      ? 'bg-emerald-500 text-black shadow-md' 
                      : 'text-emerald-300/60 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-200/40">NILAI INVESTASI:</span>
                <span className="text-white font-bold">Rp {investmentAmt.toLocaleString('id-ID')}</span>
              </div>
              <input
                type="range"
                min={10000000} // 10 Million
                max={500000000} // 500 Million
                step={5000000} // 5 Million step
                value={investmentAmt}
                onChange={e => setInvestmentAmt(Number(e.target.value))}
                className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-emerald-200/35">
                <span>Rp 10 Juta</span>
                <span>Rp 500 Juta</span>
              </div>
            </div>

          </div>

          {/* Results Summary Box */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-emerald-950/60 pb-2">
              <span className="text-emerald-200/60">Proyek Dipilih:</span>
              <span className="font-bold text-white text-right truncate max-w-[170px]">{calc.projectTitle}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-emerald-200/40 font-mono block">NISBAH PROYEKSI</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{calc.roiRate} p.a.</span>
              </div>
              <div>
                <span className="text-[9px] text-emerald-200/40 font-mono block">ESTIMASI BAGI HASIL</span>
                <span className="text-sm font-extrabold text-white mt-1 block">{calc.annualPayout}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-950/60 flex items-center justify-between text-xs">
              <span className="text-emerald-200/60 flex items-center gap-1">
                <Leaf size={11} className="text-emerald-400" /> Carbon Offset Tahunan:
              </span>
              <span className="font-extrabold text-emerald-400 font-mono">{calc.carbonOffset}</span>
            </div>
          </div>

        </div>

        {/* Right: Active Green Sukuk Projects Tracking */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-black/30 flex flex-col justify-between space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity size={16} />
            </div>
            <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider">
              Realisasi & Kinerja Proyek Berjalan
            </h4>
          </div>

          <div className="space-y-4">
            
            {/* Project 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">Biogas POME Methane Capture</span>
                  <span className="text-[9px] text-emerald-400/50 block font-mono">PT Borneo Palm Energy • Kalteng</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">85%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-emerald-950/50 h-2 rounded-full overflow-hidden border border-emerald-900/30">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-emerald-200/40">
                <span>Terpasang: 38.250 m³</span>
                <span>Target: 45.000 m³</span>
              </div>
            </div>

            {/* Project 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">Peremajaan Sawit Rakyat (Replanting)</span>
                  <span className="text-[9px] text-blue-400/50 block font-mono">PT Riau Agromakmur • Kampar, Riau</span>
                </div>
                <span className="font-mono text-blue-400 font-bold">60%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-blue-950/50 h-2 rounded-full overflow-hidden border border-blue-900/30">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-emerald-200/40">
                <span>Luas Tanam: 14.8 Hektar</span>
                <span>Target: 24.7 Hektar</span>
              </div>
            </div>

            {/* Project 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">Composting Unit & Organic Fertilizer</span>
                  <span className="text-[9px] text-cyan-400/50 block font-mono">PT Sumatera Palm Lestari • Sumut</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">30%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-cyan-950/50 h-2 rounded-full overflow-hidden border border-cyan-900/30">
                <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: '30%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-emerald-200/40">
                <span>Diproduksi: 660 Ton</span>
                <span>Target: 2.200 Ton</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 3: MY GREEN SUKUK CERTIFICATES */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider flex items-center gap-2">
          <Award size={16} className="text-amber-400" />
          Kepemilikan Sertifikat Sukuk Hijau (Ledger Verified)
        </h4>

        <div className="glass-panel overflow-x-auto rounded-xl border border-emerald-950/60 bg-black/20">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-emerald-950/80 bg-black/40 text-emerald-400 font-mono uppercase tracking-wider text-[10px]">
                <th className="p-4">Kode Sertifikat</th>
                <th className="p-4">Nama Proyek</th>
                <th className="p-4">Nilai Investasi</th>
                <th className="p-4">Nisbah Bagi Hasil</th>
                <th className="p-4">Kupon Terdekat</th>
                <th className="p-4 text-center">Status Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40 font-medium">
              <tr>
                <td className="p-4 font-mono text-white">SK-2026-BPE-041</td>
                <td className="p-4 text-emerald-100">Biogas POME Methane Capture - PT Borneo Palm Energy</td>
                <td className="p-4 text-white">Rp 75,000,000</td>
                <td className="p-4 text-emerald-400">8.2% p.a.</td>
                <td className="p-4">15 Juli 2026</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-mono">
                    <ShieldCheck size={11} /> Verified & Active
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-white">SK-2026-RAM-108</td>
                <td className="p-4 text-emerald-100">PSR Replanting Kelapa Sawit - PT Riau Agromakmur</td>
                <td className="p-4 text-white">Rp 45,500,000</td>
                <td className="p-4 text-emerald-400">7.5% p.a.</td>
                <td className="p-4">01 Agustus 2026</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-mono">
                    <ShieldCheck size={11} /> Verified & Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
