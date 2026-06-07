import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import SupplyChainMap from './supply-chain-map';
import Link from 'next/link';
import { getFeaturedTraceabilityLog, type TraceabilityLog } from '@/lib/batch-passport';
import { appendLedgerEvent } from '@/lib/ledger';

export const dynamic = 'force-dynamic';

export default async function TraceabilityPage() {
  let blockchainLogs: TraceabilityLog[] = [];
  let fetchError: string | null = null;

  try {
    const dbResult = await query<TraceabilityLog>('SELECT * FROM traceability_logs ORDER BY created_at DESC');
    blockchainLogs = dbResult.rows;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    fetchError = `Gagal membaca data traceability_logs: ${message}`;
    console.error(fetchError, e);
  }

  async function addTraceabilityLog(formData: FormData) {
    'use server';

    const batchId = formData.get('batch_id') as string;
    const farmerName = formData.get('farmer_name') as string;
    const tbsWeightKg = Number(formData.get('tbs_weight_kg'));
    const pksDestination = formData.get('pks_destination') as string;
    const status = formData.get('status') as string;

    const rawData = `${batchId}-${farmerName}-${tbsWeightKg}-${pksDestination}-${Date.now()}`;
    const hash = '0x' + crypto.createHash('sha256').update(rawData).digest('hex');

    try {
      await query(
        `INSERT INTO traceability_logs (batch_id, farmer_name, tbs_weight_kg, pks_destination, blockchain_hash, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [batchId, farmerName, tbsWeightKg, pksDestination, hash, status]
      );

      // Append this event to the cryptographic ledger
      await appendLedgerEvent({
        entityType: 'traceability',
        entityId: batchId,
        action: 'verify_traceability',
        actor: {
          name: farmerName,
        },
        payload: {
          tbs_weight_kg: tbsWeightKg,
          pks_destination: pksDestination,
          status: status,
          blockchain_hash: hash,
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('Gagal menyimpan log ketelusuran ke database:', message, e);
      throw new Error(`Gagal menyimpan log ketelusuran: ${message}`);
    }

    revalidatePath('/governance/traceability');
  }

  const featuredLog = getFeaturedTraceabilityLog();
  const integratedLogs = [
    featuredLog,
    ...blockchainLogs.filter((log) => log.batch_id !== featuredLog.batch_id),
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          Blockchain Traceability
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">Traceability Ledger</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Pelacakan rantai pasok TBS secara real-time, transparan, dan terenkripsi.
        </p>
      </div>

      <SupplyChainMap
        logs={integratedLogs.map((log) => ({
          ...log,
          created_at: new Date(log.created_at).toISOString(),
        }))}
      />

      <div className="glass-panel p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-emerald-50 mb-4 font-space">Input Log Pengiriman TBS Baru</h2>

        {fetchError ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            <p className="font-semibold">Ada masalah koneksi database.</p>
            <p>{fetchError}</p>
            <p className="mt-2 text-xs text-red-200/70">
              Pastikan tabel <code>traceability_logs</code> sudah ada dan environment database Supabase terhubung.
            </p>
          </div>
        ) : null}

        <form action={addTraceabilityLog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Batch ID</label>
            <input type="text" name="batch_id" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: BATCH-2026-003" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Nama Petani / Koperasi</label>
            <input type="text" name="farmer_name" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: Kelompok Tani Sawit Jaya" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Berat TBS (Kg)</label>
            <input type="number" step="0.01" name="tbs_weight_kg" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: 3500.00" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Pabrik Kelapa Sawit (PKS) Tujuan</label>
            <input type="text" name="pks_destination" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: PKS PT Aura Sawit" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-emerald-200/70 mb-1">Status Verifikasi</label>
            <select name="status" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500">
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-2">
            <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-2.5 px-4 rounded-md hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              Catat Log ke Blockchain Ledger
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-900/70 bg-black/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-emerald-50 font-space">Blockchain Ledger Logs</h2>
          <span className="bg-emerald-500/10 text-emerald-300 text-xs font-mono px-2.5 py-1 rounded border border-emerald-500/30">
            Node Connected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-emerald-900/70 text-xs text-emerald-400 uppercase font-mono tracking-wider">
                <th className="px-6 py-3 font-medium">Batch ID</th>
                <th className="px-6 py-3 font-medium">Petani / Koperasi</th>
                <th className="px-6 py-3 font-medium">Berat (Kg)</th>
                <th className="px-6 py-3 font-medium">PKS Tujuan</th>
                <th className="px-6 py-3 font-medium">Blockchain Hash</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Waktu</th>
                <th className="px-6 py-3 font-medium">Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80 text-sm">
              {integratedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-emerald-950/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-emerald-300">{log.batch_id}</td>
                  <td className="px-6 py-4 text-emerald-100">{log.farmer_name}</td>
                  <td className="px-6 py-4 text-emerald-50 font-medium">
                    {Number(log.tbs_weight_kg).toLocaleString('id-ID')} Kg
                  </td>
                  <td className="px-6 py-4 text-emerald-200/60">{log.pks_destination}</td>
                  <td className="px-6 py-4 font-mono text-xs text-emerald-400/60 max-w-xs truncate" title={log.blockchain_hash}>
                    {log.blockchain_hash}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      log.status === 'Terverifikasi'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : log.status === 'Dalam Proses'
                          ? 'bg-lime-500/15 text-lime-300 border-lime-500/30'
                          : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-200/50 text-xs">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/verify/${encodeURIComponent(log.batch_id)}`}
                      className="inline-flex rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-black"
                    >
                      View Passport
                    </Link>
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
