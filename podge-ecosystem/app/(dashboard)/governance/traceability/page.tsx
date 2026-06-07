import { query } from '@/lib/db';

export const metadata = {
  title: 'Blockchain Traceability',
  description: 'Lihat catatan traceability minyak sawit yang tersimpan di blockchain.',
};

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

export default async function TraceabilityPage() {
  let logs: TraceabilityLog[] = [];
  let errorMessage: string | null = null;

  try {
    logs = await getTraceabilityLogs();
  } catch (error) {
    console.error('Failed to load traceability logs', error);
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Terjadi kesalahan tidak terduga saat mengambil data traceability.';
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blockchain Traceability</h1>
        <p className="text-sm text-gray-500 mt-1">
          Data traceability minyak sawit yang tersimpan di tabel `traceability_logs`.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-semibold">Ada masalah koneksi database</h2>
          <p className="mt-2 text-sm">
            Gagal membaca data `traceability_logs`. Pastikan tabel sudah ada dan environment database Supabase terhubung.
          </p>
          <p className="mt-3 text-xs text-red-600">Detail: {errorMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Batch ID</th>
                <th className="px-4 py-3 font-medium">Petani</th>
                <th className="px-4 py-3 font-medium">Berat TBS (kg)</th>
                <th className="px-4 py-3 font-medium">Lokasi</th>
                <th className="px-4 py-3 font-medium">Blockchain Hash</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    Tidak ada data traceability yang tersedia.
                  </td>
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
                    <td className="px-4 py-4 text-slate-900">
                      {new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
