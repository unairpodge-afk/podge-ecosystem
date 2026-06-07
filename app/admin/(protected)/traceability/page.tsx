import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { Check, X, Award, FileText, Undo2 } from 'lucide-react';
import { appendLedgerEvent } from '@/lib/ledger';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type TraceLog = {
  id: string | number;
  batch_id: string;
  farmer_name: string;
  tbs_weight_kg: number;
  pks_destination: string;
  blockchain_hash: string;
  status: string;
  created_at: string;
};

async function updateTraceabilityStatus({
  rowId,
  batchId,
  status,
  blockchainHash,
}: {
  rowId: string;
  batchId: string;
  status: 'Terverifikasi' | 'Tertunda';
  blockchainHash?: string;
}) {
  const trimmedRowId = rowId.trim();
  const trimmedBatchId = batchId.trim();

  if (!trimmedRowId && !trimmedBatchId) {
    throw new Error('Row ID atau Batch ID wajib tersedia.');
  }

  if (trimmedRowId) {
    return query<Pick<TraceLog, 'id' | 'batch_id'>>(
      `UPDATE traceability_logs
       SET status = $2,
           blockchain_hash = COALESCE($3, blockchain_hash)
       WHERE id::text = $1
       RETURNING id, batch_id`,
      [trimmedRowId, status, blockchainHash || null],
    );
  }

  return query<Pick<TraceLog, 'id' | 'batch_id'>>(
    `UPDATE traceability_logs
     SET status = $2,
         blockchain_hash = COALESCE($3, blockchain_hash)
     WHERE batch_id = $1
     RETURNING id, batch_id`,
    [trimmedBatchId, status, blockchainHash || null],
  );
}

export default async function AdminTraceabilityPage() {
  const { admin } = await requireAdmin();

  // Server Action to Approve/Verify Batch
  async function approveBatchAction(formData: FormData) {
    'use server';
    const batchId = formData.get('batchId') as string;
    const rowId = formData.get('rowId') as string;
    const note = formData.get('note') as string || '';
    const { admin: activeAdmin } = await requireAdmin();

    const freshHash = '0x' + crypto.createHash('sha256').update(`${batchId}-${Date.now()}`).digest('hex');

    try {
      // 1. Update DB log status
      const updateResult = await updateTraceabilityStatus({
        rowId,
        batchId,
        status: 'Terverifikasi',
        blockchainHash: freshHash,
      });

      if (updateResult.rowCount === 0) {
        throw new Error(`Batch ${batchId} tidak ditemukan di traceability_logs.`);
      }

      const updatedBatchId = updateResult.rows[0]?.batch_id || batchId;

      // 2. Append event to cryptographic Ledger
      await appendLedgerEvent({
        entityType: 'traceability',
        entityId: updatedBatchId,
        action: 'approve_traceability_batch',
        actor: {
          adminId: activeAdmin.admin_id,
          roleId: activeAdmin.role_id,
          name: activeAdmin.full_name,
        },
        payload: {
          verified_by: activeAdmin.full_name,
          verification_note: note || 'Lolos peninjauan kriteria keterlacakan BPDPKS',
          blockchain_hash: freshHash,
          status: 'Terverifikasi',
          row_id: rowId || null,
        }
      });
    } catch (err) {
      console.error('Gagal menyetujui batch sawit:', err);
    }

    revalidatePath('/admin/traceability');
    revalidatePath('/governance/traceability');
    revalidatePath(`/verify/${encodeURIComponent(batchId)}`);
  }

  // Server Action to Put Batch on Pending/Review
  async function rejectBatchAction(formData: FormData) {
    'use server';
    const batchId = formData.get('batchId') as string;
    const rowId = formData.get('rowId') as string;
    const note = formData.get('note') as string || '';
    const { admin: activeAdmin } = await requireAdmin();

    try {
      // 1. Update DB status to Tertunda
      const updateResult = await updateTraceabilityStatus({
        rowId,
        batchId,
        status: 'Tertunda',
      });

      if (updateResult.rowCount === 0) {
        throw new Error(`Batch ${batchId} tidak ditemukan di traceability_logs.`);
      }

      const updatedBatchId = updateResult.rows[0]?.batch_id || batchId;

      // 2. Append event to Ledger
      await appendLedgerEvent({
        entityType: 'traceability',
        entityId: updatedBatchId,
        action: 'reject_traceability_batch',
        actor: {
          adminId: activeAdmin.admin_id,
          roleId: activeAdmin.role_id,
          name: activeAdmin.full_name,
        },
        payload: {
          rejected_by: activeAdmin.full_name,
          rejection_note: note || 'Dibutuhkan review ulang berkas pengiriman',
          status: 'Tertunda',
          row_id: rowId || null,
        }
      });
    } catch (err) {
      console.error('Gagal menunda batch sawit:', err);
    }

    revalidatePath('/admin/traceability');
    revalidatePath('/governance/traceability');
    revalidatePath(`/verify/${encodeURIComponent(batchId)}`);
  }

  // Fetch all batch logs
  let logs: TraceLog[] = [];
  try {
    const res = await query<TraceLog>('SELECT * FROM traceability_logs ORDER BY created_at DESC');
    logs = res.rows;
  } catch (err) {
    console.error('Error fetching logs for admin:', err);
  }

  // Calculate Metrics
  const total = logs.length;
  const verified = logs.filter(l => l.status === 'Terverifikasi').length;
  const pending = logs.filter(l => l.status !== 'Terverifikasi').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          <Award size={14} className="animate-pulse" />
          Traceability Oversight
        </div>
        <h1 className="mt-3 font-space text-3xl font-extrabold text-white">BPDPKS Blockchain Traceability Panel</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60 font-space">
          Evaluasi legalitas pengiriman batch Tandan Buah Segar (TBS) dari lahan petani swadaya menuju Pabrik Kelapa Sawit (PKS) tujuan. Anda bertindak sebagai verifikator <span className="font-bold text-emerald-200">{admin.role_name}</span>.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-lg p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Total Pengiriman TBS</p>
          <p className="mt-2 font-space text-3xl font-extrabold text-white">{total}</p>
          <p className="mt-2 text-xs leading-5 text-emerald-100/55">Seluruh batch terdaftar di ledger.</p>
        </div>
        <div className="glass-panel rounded-lg p-5 border-emerald-500/20">
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">Batch Lolos Verifikasi</p>
          <p className="mt-2 font-space text-3xl font-extrabold text-emerald-400">{verified}</p>
          <p className="mt-2 text-xs leading-5 text-emerald-100/55">Telah diterbitkan sertifikat digital passport.</p>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-300">Menunggu Audit</p>
          <p className="mt-2 font-space text-3xl font-extrabold text-yellow-200">{pending}</p>
          <p className="mt-2 text-xs leading-5 text-emerald-100/55">Membutuhkan peninjauan dokumen jalan / polygon.</p>
        </div>
      </div>

      {/* Main Table Grid */}
      <section className="rounded-xl border border-emerald-900/60 bg-black/25 overflow-hidden">
        <div className="border-b border-emerald-900/60 px-6 py-4">
          <h2 className="font-space text-lg font-bold text-emerald-50">Daftar Audit Passport Pengiriman TBS</h2>
          <p className="mt-1 text-xs text-emerald-200/55">
            Lakukan verifikasi berat timbangan koperasi, kesesuaian geofence, dan tanda tangani passport secara digital.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-900/60 text-[10px] uppercase tracking-widest text-emerald-400 font-mono">
                <th className="px-5 py-3.5 font-semibold">Batch ID</th>
                <th className="px-5 py-3.5 font-semibold">Petani / Koperasi</th>
                <th className="px-5 py-3.5 font-semibold">Berat & PKS Tujuan</th>
                <th className="px-5 py-3.5 font-semibold">Waktu Catat</th>
                <th className="px-5 py-3.5 font-semibold">Status Passport</th>
                <th className="px-5 py-3.5 font-semibold text-center">Tindakan Audit</th>
                <th className="px-5 py-3.5 font-semibold">Tampilan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80">
              {logs.map((log) => (
                <tr key={String(log.id)} className="text-emerald-50/85 hover:bg-emerald-950/10">
                  <td className="px-5 py-4 font-mono font-bold text-emerald-300">
                    {log.batch_id}
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">
                    {log.farmer_name}
                  </td>
                  <td className="px-5 py-4">
                    <p>{Number(log.tbs_weight_kg).toLocaleString('id-ID')} Kg</p>
                    <p className="text-xs text-emerald-400/65 mt-0.5">{log.pks_destination}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-emerald-200/50">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      log.status === 'Terverifikasi'
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                        : log.status === 'Dalam Proses'
                          ? 'border-lime-400/40 bg-lime-500/15 text-lime-300'
                          : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-5 py-4 text-center">
                    {log.status !== 'Terverifikasi' ? (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <form action={approveBatchAction} className="flex items-center justify-center gap-2">
                          <input type="hidden" name="rowId" value={String(log.id)} />
                          <input type="hidden" name="batchId" value={log.batch_id} />
                          <input
                            type="text"
                            name="note"
                            placeholder="Catatan verifikasi..."
                            className="bg-black/40 border border-emerald-950 text-xs px-2.5 py-1.5 rounded-lg outline-none text-emerald-50 placeholder-emerald-900 focus:border-emerald-600 w-44"
                          />
                          <button
                            type="submit"
                            title="Setujui Keterlacakan Batch"
                            className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                          >
                            <Check size={14} className="stroke-[3]" />
                          </button>
                        </form>
                        <form action={rejectBatchAction}>
                          <input type="hidden" name="rowId" value={String(log.id)} />
                          <input type="hidden" name="batchId" value={log.batch_id} />
                          <button
                            type="submit"
                            title="Tandai Audit Tertunda"
                            className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
                          >
                            <X size={14} className="stroke-[3]" />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <form action={rejectBatchAction} className="flex items-center justify-center gap-2">
                        <input type="hidden" name="rowId" value={String(log.id)} />
                        <input type="hidden" name="batchId" value={log.batch_id} />
                        <input
                          type="text"
                          name="note"
                          placeholder="Catatan reset..."
                          className="bg-black/40 border border-emerald-950 text-xs px-2.5 py-1.5 rounded-lg outline-none text-emerald-50 placeholder-emerald-900 focus:border-emerald-600 w-44"
                        />
                        <button
                          type="submit"
                          title="Kembalikan Status ke Pending/Review"
                          className="p-1.5 rounded-lg border border-yellow-700/60 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/50 transition flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                        >
                          <Undo2 size={12} />
                          Reset Status
                        </button>
                      </form>
                    )}
                  </td>

                  {/* Public Link */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/verify/${encodeURIComponent(log.batch_id)}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/60 px-3 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-950/70"
                    >
                      <FileText size={12} />
                      Lihat Passport
                    </Link>
                  </td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-emerald-200/55">
                    Belum ada batch pengiriman TBS terdaftar.
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
