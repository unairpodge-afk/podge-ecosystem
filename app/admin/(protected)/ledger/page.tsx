import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { ensureLedgerEventsTable, type LedgerEventRecord } from '@/lib/ledger';
import { ShieldCheck, History, Database, ArrowRight, UserCheck, Key, FileCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLedgerPage() {
  const { admin } = await requireAdmin();
  await ensureLedgerEventsTable();

  let events: LedgerEventRecord[] = [];
  let errorMsg = '';

  try {
    const res = await query<LedgerEventRecord>(
      'SELECT * FROM ledger_events ORDER BY created_at DESC LIMIT 100'
    );
    events = res.rows;
  } catch (err: any) {
    errorMsg = err.message || 'Gagal mengambil data ledger.';
    console.error('Error fetching ledger events:', err);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            <History size={14} className="animate-pulse" />
            Audit Ledger
          </div>
          <h1 className="mt-3 font-space text-3xl font-extrabold text-white">Cryptographic Event Ledger</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60 font-space">
            Daftar audit log kriptografis berantai (hash-chain) yang mencatat pendaftaran identitas petani, klaim FarmID, verifikasi data sawit, serta pencatatan traceability oleh petani/koperasi.
          </p>
        </div>
      </div>

      {/* Warning/Error if DB fails */}
      {errorMsg && (
        <div className="rounded-xl border border-red-500/25 bg-red-950/20 p-4 text-sm text-red-200">
          <p className="font-bold">Gagal memuat Ledger:</p>
          <p className="mt-1 text-xs text-red-300/80">{errorMsg}</p>
        </div>
      )}

      {/* Audit Log Table Card */}
      <section className="rounded-xl border border-emerald-900/60 bg-black/25 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="px-6 py-4 border-b border-emerald-900/60 bg-black/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-emerald-50 font-space flex items-center gap-2">
            <Database size={18} className="text-emerald-400" />
            Rantai Peristiwa Kriptografis (Hash Chain)
          </h2>
          <span className="bg-emerald-500/10 text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded border border-emerald-500/30 uppercase tracking-widest">
            {events.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-900/60 text-[10px] uppercase tracking-widest text-emerald-400 font-mono">
                <th className="px-6 py-3.5 font-semibold">Waktu & Hash Peristiwa</th>
                <th className="px-6 py-3.5 font-semibold">Tipe & ID Entitas</th>
                <th className="px-6 py-3.5 font-semibold">Aksi Audit</th>
                <th className="px-6 py-3.5 font-semibold">Pelaku / Aktor</th>
                <th className="px-6 py-3.5 font-semibold">Previous Hash</th>
                <th className="px-6 py-3.5 font-semibold">Payload Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/75 text-emerald-50/85">
              {events.map((event) => {
                const isTraceability = event.entity_type === 'traceability';
                const isFarmId = event.entity_type === 'farmid';
                const isIdentity = event.entity_type === 'identity';

                return (
                  <tr key={event.event_id} className="hover:bg-emerald-950/10 transition-colors">
                    {/* Timestamp & Current Hash */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-emerald-200/50">
                        {new Date(event.created_at).toLocaleString('id-ID')}
                      </p>
                      <p className="font-mono text-[10px] text-emerald-400 mt-1 select-all" title={event.event_hash}>
                        {event.event_hash.substring(0, 16)}...
                      </p>
                    </td>

                    {/* Entity Type & ID */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isTraceability
                          ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                          : isFarmId
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                      }`}>
                        {event.entity_type}
                      </span>
                      <p className="font-mono text-[10px] text-emerald-100/70 mt-1 select-all">
                        {event.entity_id}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-emerald-200">
                      {event.action}
                    </td>

                    {/* Actor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <UserCheck size={14} className="text-emerald-400" />
                        <span className="font-semibold text-white text-xs">{event.actor_name}</span>
                      </div>
                      {event.actor_role_id && (
                        <p className="text-[9px] font-mono text-emerald-400/60 uppercase tracking-widest mt-0.5">
                          {event.actor_role_id}
                        </p>
                      )}
                    </td>

                    {/* Previous Hash Link */}
                    <td className="px-6 py-4">
                      {event.previous_hash ? (
                        <p className="font-mono text-[10px] text-emerald-600/70 truncate max-w-[120px]" title={event.previous_hash}>
                          {event.previous_hash.substring(0, 12)}...
                        </p>
                      ) : (
                        <span className="text-[9px] font-mono text-emerald-600/40 uppercase tracking-widest">
                          [Genesis Block]
                        </span>
                      )}
                    </td>

                    {/* Payload JSON */}
                    <td className="px-6 py-4 max-w-sm">
                      <details className="cursor-pointer group">
                        <summary className="text-[11px] font-mono text-emerald-400/70 hover:text-emerald-300 select-none">
                          Lihat Payload ({Object.keys(event.payload || {}).length} keys)
                        </summary>
                        <pre className="mt-2 text-[10px] font-mono bg-black/60 border border-emerald-950 p-2.5 rounded-lg text-emerald-300 overflow-x-auto max-h-40 whitespace-pre-wrap select-all leading-normal">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                );
              })}

              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-emerald-300/40 font-mono">
                    Belum ada peristiwa audit yang tercatat di Ledger.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
