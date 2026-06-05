"use client"; // Wajib ditambahkan untuk komponen interaktif (grafik)

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- Data Simulasi (Nanti bisa diganti dengan tarikan SQL dari Supabase) ---
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

export default function EconomicImpactPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Economic Impact Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visualisasi Peningkatan Produktivitas, Efisiensi Biaya, dan Pendapatan Petani Sawit.
        </p>
      </div>

      {/* Rangkuman Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Peningkatan Produktivitas</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">+24.5%</p>
          <p className="text-xs text-green-600 mt-1">Sejak implementasi Digital Governance</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500">Efisiensi Biaya Operasional</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">-15.2%</p>
          <p className="text-xs text-blue-600 mt-1">Optimalisasi rantai pasok</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-gray-500">Daya Saing Industri</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">Level A</p>
          <p className="text-xs text-amber-600 mt-1">Sertifikasi ISPO/RSPO Terpenuhi</p>
        </div>
      </div>

      {/* Area Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Grafik 1: Tren Produktivitas */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Tren Produktivitas TBS (Ton/Ha)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="produksi" name="Produksi Aktual" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="target" name="Target Dasar" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Pendapatan vs Biaya */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Pendapatan vs Biaya (Juta Rupiah)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="pendapatan" name="Pendapatan Bersih" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="biaya" name="Biaya Operasional" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}