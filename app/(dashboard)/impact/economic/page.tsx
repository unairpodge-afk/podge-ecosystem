'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Coins, Flame, Landmark, Leaf, TrendingUp } from 'lucide-react';

const pricingComparisonData = [
  { month: 'Jan', baseline: 2450, premium: 2850 },
  { month: 'Feb', baseline: 2480, premium: 2880 },
  { month: 'Mar', baseline: 2420, premium: 2820 },
  { month: 'Apr', baseline: 2510, premium: 2910 },
  { month: 'Mei', baseline: 2550, premium: 2950 },
];

const carbonOffsetData = [
  { year: '2022', offset: 12000, target: 15000 },
  { year: '2023', offset: 25000, target: 30000 },
  { year: '2024', offset: 48000, target: 50000 },
  { year: '2025', offset: 75000, target: 75000 },
  { year: '2026', offset: 118000, target: 110000 },
];

const tooltipStyle = {
  background: 'rgba(4, 8, 6, 0.96)',
  border: '1px solid rgba(16, 185, 129, 0.28)',
  borderRadius: '8px',
  color: '#d1fae5',
  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
};

export default function EconomicImpactPage() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          Economic & Environmental Impact Layer
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">ESG & Economic Impact</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Analisis nilai tambah dari insentif harga TBS berkelanjutan, dekarbonisasi biogas, dan efisiensi rantai pasok kelapa sawit.
        </p>
      </div>

      {/* Industrial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Premi Harga Berkelanjutan', value: '+Rp 400 / Kg', note: 'Insentif tambahan di atas harga pasar dasar', icon: Coins },
          { label: 'Reduksi Methane (POME)', value: '118k Ton CO2e', note: 'Ditangkap melalui fasilitas biogas terdanai', icon: Flame },
          { label: 'Pendapatan Petani Swadaya', value: '+34.2%', note: 'Kenaikan rata-rata pendapatan bersih bulanan', icon: TrendingUp },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="glass-panel p-6 rounded-xl border-l-4 border-l-emerald-500 flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-emerald-200/65">{metric.label}</p>
                <p className="text-3xl font-extrabold text-emerald-50 font-space">{metric.value}</p>
                <p className="text-xs text-emerald-400 font-mono">{metric.note}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pricing comparison line chart */}
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-emerald-50 font-space">Perbandingan Harga TBS (Rupiah/Kg)</h2>
              <p className="text-xs text-emerald-200/50 mt-1">Dampak premium pricing (Incentive Hijau) bagi petani bersertifikasi</p>
            </div>
            <Landmark size={20} className="text-emerald-400" />
          </div>
          
          <div className="h-80 w-full">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <LineChart data={pricingComparisonData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,185,129,0.18)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} dy={10} />
                  <YAxis domain={[2000, 3200]} axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px', color: '#d1fae5' }} />
                  <Line type="monotone" dataKey="premium" name="Harga TBS Premium (Sustainable)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="baseline" name="Harga TBS Pasar (Baseline)" stroke="#84cc16" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg border border-emerald-900/50 bg-black/20" />
            )}
          </div>
        </div>

        {/* Carbon avoidance bar chart */}
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-emerald-50 font-space">Jejak Emisi Terhindar (Ton CO2e)</h2>
              <p className="text-xs text-emerald-200/50 mt-1">Akumulasi reduksi emisi metana dari pengolahan limbah biogas POME</p>
            </div>
            <Leaf size={20} className="text-emerald-400" />
          </div>

          <div className="h-80 w-full">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={carbonOffsetData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,185,129,0.18)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} />
                  <Tooltip cursor={{ fill: 'rgba(16,185,129,0.08)' }} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px', color: '#d1fae5' }} />
                  <Bar dataKey="offset" name="Emisi Terhindar Aktual" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target Dekarbonisasi" fill="rgba(132, 204, 22, 0.4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg border border-emerald-900/50 bg-black/20" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
