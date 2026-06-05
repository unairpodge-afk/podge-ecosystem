import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export default async function TraceabilityPage() {
  // 1. MENGAMBIL DATA TRACEABILITY (READ)
  let blockchainLogs = [];
  let fetchError: string | null = null;

  try {
    const dbResult = await query('SELECT * FROM traceability_logs ORDER BY created_at DESC');
    blockchainLogs = dbResult.rows;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    fetchError = `Gagal membaca data traceability_logs: ${message}`;
    console.error(fetchError, e);
  }

  // 2. SERVER ACTION UNTUK MENAMBAH LOG TRACEABILITY (CREATE)
  async function addTraceabilityLog(formData: FormData) {
    "use server";
    
    const batchId = formData.get('batch_id') as string;
    const farmerName = formData.get('farmer_name') as string;
    const tbsWeightKg = Number(formData.get('tbs_weight_kg'));
    const pksDestination = formData.get('pks_destination') as string;
    const status = formData.get('status') as string;

    // Menghasilkan simulasi hash blockchain SHA-256 (64 karakter + prefix 0x = 66 karakter)
    const rawData = `${batchId}-${farmerName}-${tbsWeightKg}-${pksDestination}-${Date.now()}`;
    const hash = '0x' + crypto.createHash('sha256').update(rawData).digest('hex');

    try {
      await query(
        `INSERT INTO traceability_logs (batch_id, farmer_name, tbs_weight_kg, pks_destination, blockchain_hash, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [batchId, farmerName, tbsWeightKg, pksDestination, hash, status]
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('Gagal menyimpan log ketelusuran ke database:', message, e);
      throw new Error(`Gagal menyimpan log ketelusuran: ${message}`);
    }

    revalidatePath('/governance/traceability');
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blockchain Traceability</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pelacakan Rantai Pasok TBS (Tandan Buah Segar) secara Real-Time & Transparan
        </p>
      </div>

      {/* Form Log Baru */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Input Log Pengiriman TBS Baru</h2>

        {fetchError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">Ada masalah koneksi database.</p>
            <p>{fetchError}</p>
            <p className="mt-2 text-xs text-red-600">
              Pastikan tabel <code>traceability_logs</code> sudah ada dan environment database Supabase terhubung.
            </p>
          </div>
        ) : null}

        <form action={addTraceabilityLog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Batch ID</label>
            <input type="text" name="batch_id" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: BATCH-2026-003" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Nama Petani / Koperasi</label>
            <input type="text" name="farmer_name" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: Kelompok Tani Sawit Jaya" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Berat TBS (Kg)</label>
            <input type="number" step="0.01" name="tbs_weight_kg" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: 3500.00" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Pabrik Kelapa Sawit (PKS) Tujuan</label>
            <input type="text" name="pks_destination" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: PKS PT Aura Sawit" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-600 mb-1">Status Verifikasi</label>
            <select name="status" className="border border-gray-300 rounded-md p-2 bg-white">
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-2">
            <button type="submit" className="w-full bg-green-700 text-white font-medium py-2 px-4 rounded-md hover:bg-green-800 transition-colors">
              Catat Log ke Blockchain Ledger
            </button>
          </div>
        </form>
      </div>

      {/* Blockchain Ledgers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Blockchain Ledger Logs</h2>
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            Decentralized Node Connected
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Batch ID</th>
                <th className="px-6 py-3 font-medium">Petani / Koperasi</th>
                <th className="px-6 py-3 font-medium">Berat (Kg)</th>
                <th className="px-6 py-3 font-medium">PKS Tujuan</th>
                <th className="px-6 py-3 font-medium">Blockchain Hash</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Waktu Pencatatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {blockchainLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{log.batch_id}</td>
                  <td className="px-6 py-4 text-gray-600">{log.farmer_name}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {Number(log.tbs_weight_kg).toLocaleString('id-ID')} Kg
                  </td>
                  <td className="px-6 py-4 text-gray-600">{log.pks_destination}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400 max-w-xs truncate" title={log.blockchain_hash}>
                    {log.blockchain_hash}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'Terverifikasi' ? 'bg-green-100 text-green-700' : 
                      log.status === 'Dalam Proses' ? 'bg-sky-100 text-sky-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
