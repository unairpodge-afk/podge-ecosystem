import Link from 'next/link';
import { query } from '@/lib/db';

type TraceabilityLog = {
  id: number;
  batch_id: string;
  farmer_name: string;
  tbs_weight_kg: string;
  location: string;
  blockchain_hash: string;
  status: string;
  created_at: string;
};

async function getTraceabilityLogs() {
  const result = await query(
    `select id, batch_id, farmer_name, tbs_weight_kg, pks_destination as location, blockchain_hash, status, created_at from public.traceability_logs order by created_at desc limit 50`
  );
  return result.rows as TraceabilityLog[];
}

export default async function HomePage() {
  let logs: TraceabilityLog[] = [];
  try {
    logs = await getTraceabilityLogs();
  } catch (e) {
    console.error('Failed to load traceability logs on homepage', e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Green Sukuk Portfolio</h1>
        <p className="text-sm text-gray-500 mt-1">Instrumen Keuangan Syariah untuk Proyek Sawit Berkelanjutan</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/governance/farmid" className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-green-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Farm ID</h3>
          <p className="mt-2 text-sm text-gray-600">Pelajari alur FarmID, barcode private & publik, dan status panen petani.</p>
        </Link>
        <Link href="/admin/login" className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-green-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Admin Login</h3>
          <p className="mt-2 text-sm text-gray-600">Akses dashboard governance untuk verifikasi dan audit terpisah.</p>
        </Link>
        <Link href="/identity/access" className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-green-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Identity Access</h3>
          <p className="mt-2 text-sm text-gray-600">Kelola akses identitas untuk petani, admin, dan publik.</p>
        </Link>
        <Link href="/identity/view" className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-green-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Identity View</h3>
          <p className="mt-2 text-sm text-gray-600">Lihat ringkasan identitas publik setelah verifikasi.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Dana Disalurkan</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">Rp 4.2 Triliun</p>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded mt-2 inline-block">+12% dari Kuartal Lalu</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Lahan Tervalidasi RSPO</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">124.500 Ha</p>
          <span className="text-xs text-gray-500 mt-2 inline-block">Terhubung via Analytics Layer</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Potensi Serapan Karbon</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">850k Ton CO₂e</p>
          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded mt-2 inline-block">Sesuai Metrik ESG</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Daftar Proyek Berkelanjutan (Traceability Logs)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Batch ID</th>
                <th className="px-4 py-3 font-medium">Petani</th>
                <th className="px-4 py-3 font-medium">Berat (kg)</th>
                <th className="px-4 py-3 font-medium">Lokasi</th>
                <th className="px-4 py-3 font-medium">Blockchain Hash</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">Tidak ada data traceability yang tersedia.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-slate-900">{log.batch_id}</td>
                    <td className="px-4 py-4 text-slate-900">{log.farmer_name}</td>
                    <td className="px-4 py-4 text-slate-900">{log.tbs_weight_kg}</td>
                    <td className="px-4 py-4 text-slate-900">{log.location}</td>
                    <td className="px-4 py-4 text-slate-900 break-all">{log.blockchain_hash}</td>
                    <td className="px-4 py-4 text-slate-900">{log.status}</td>
                    <td className="px-4 py-4 text-slate-900">{new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
