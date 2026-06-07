'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const productivityData = [
  { year: '2022', produksi: 18.5, target: 18.0 },
  { year: '2023', produksi: 19.2, target: 19.0 },
  { year: '2024', produksi: 21.0, target: 20.0 },
  { year: '2025', produksi: 23.4, target: 21.0 },
  { year: '2026', produksi: 25.8, target: 22.0 },
];

const revenueData = [
  { month: 'Jan', pendapatan: 450, biaya: 300 },
  { month: 'Feb', pendapatan: 480, biaya: 290 },
  { month: 'Mar', pendapatan: 520, biaya: 280 },
  { month: 'Apr', pendapatan: 560, biaya: 275 },
  { month: 'Mei', pendapatan: 610, biaya: 270 },
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
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          Economic Impact Layer
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">Economic Impact Dashboard</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Visualisasi peningkatan produktivitas, efisiensi biaya, dan pendapatan petani sawit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Peningkatan Produktivitas', value: '+24.5%', note: 'Sejak implementasi Digital Governance' },
          { label: 'Efisiensi Biaya Operasional', value: '-15.2%', note: 'Optimalisasi rantai pasok' },
          { label: 'Daya Saing Industri', value: 'Level A', note: 'Sertifikasi ISPO/RSPO Terpenuhi' },
        ].map((metric) => (
          <div key={metric.label} className="glass-panel p-6 rounded-lg border-l-4 border-l-emerald-500">
            <p className="text-sm font-medium text-emerald-200/65">{metric.label}</p>
            <p className="text-3xl font-extrabold text-emerald-50 mt-2 font-space">{metric.value}</p>
            <p className="text-xs text-emerald-400 mt-1 font-mono">{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-emerald-50 mb-6 font-space">Tren Produktivitas TBS (Ton/Ha)</h2>
          <div className="h-80 w-full">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <LineChart data={productivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,185,129,0.18)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px', color: '#d1fae5' }} />
                  <Line type="monotone" dataKey="produksi" name="Produksi Aktual" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#34d399' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="target" name="Target Dasar" stroke="#84cc16" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg border border-emerald-900/50 bg-black/20" />
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-emerald-50 mb-6 font-space">Pendapatan vs Biaya (Juta Rupiah)</h2>
          <div className="h-80 w-full">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,185,129,0.18)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6ee7b7' }} />
                  <Tooltip cursor={{ fill: 'rgba(16,185,129,0.08)' }} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px', color: '#d1fae5' }} />
                  <Bar dataKey="pendapatan" name="Pendapatan Bersih" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="biaya" name="Biaya Operasional" fill="#84cc16" radius={[4, 4, 0, 0]} />
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
