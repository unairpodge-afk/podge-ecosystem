import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { CheckCircle2, Eye, Fingerprint, ShieldAlert, Sprout, Check, X, Undo2 } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { ensureFarmerIdsTable, type FarmerIdRecord } from '@/lib/farmid';

export const dynamic = 'force-dynamic';

type FarmIdStats = {
  total: string;
  live: string;
  draft: string;
  claimed: string;
};

export default async function AdminFarmIdOversightPage() {
  const { admin } = await requireAdmin();
  await ensureFarmerIdsTable();

  // Server Actions for KYC Verification bound via formAction
  async function verifyKycAction(formData: FormData) {
    'use server';
    const farmId = formData.get('farmId') as string;
    const note = formData.get('note') as string || '';
    const { admin: activeAdmin } = await requireAdmin();

    try {
      await query(`
        UPDATE farmer_ids
        SET 
          verification_status = 'verified',
          verified_at = NOW(),
          verified_by = $1,
          verification_note = $2,
          public_status = 'live',
          public_live_at = NOW(),
          updated_at = NOW()
        WHERE farm_id = $3
      `, [activeAdmin.admin_id, note, farmId]);
    } catch (err) {
      console.error('Gagal memverifikasi KYC:', err);
    }
    revalidatePath('/admin/farmid');
  }

  async function rejectKycAction(formData: FormData) {
    'use server';
    const farmId = formData.get('farmId') as string;
    const note = formData.get('note') as string || '';
    const { admin: activeAdmin } = await requireAdmin();

    try {
      await query(`
        UPDATE farmer_ids
        SET 
          verification_status = 'rejected',
          verified_at = NOW(),
          verified_by = $1,
          verification_note = $2,
          updated_at = NOW()
        WHERE farm_id = $3
      `, [activeAdmin.admin_id, note, farmId]);
    } catch (err) {
      console.error('Gagal menolak KYC:', err);
    }
    revalidatePath('/admin/farmid');
  }

  async function resetKycAction(formData: FormData) {
    'use server';
    const farmId = formData.get('farmId') as string;
    const note = formData.get('note') as string || '';
    const { admin: activeAdmin } = await requireAdmin();

    try {
      await query(`
        UPDATE farmer_ids
        SET 
          verification_status = 'pending',
          verified_at = NULL,
          verified_by = NULL,
          verification_note = $1,
          updated_at = NOW()
        WHERE farm_id = $2
      `, [note, farmId]);
    } catch (err) {
      console.error('Gagal me-reset KYC:', err);
    }
    revalidatePath('/admin/farmid');
  }

  const [statsResult, recordsResult] = await Promise.all([
    query<FarmIdStats>(`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE public_status = 'live')::text AS live,
        COUNT(*) FILTER (WHERE public_status <> 'live')::text AS draft,
        COUNT(*) FILTER (WHERE is_claimed = true)::text AS claimed
      FROM farmer_ids
    `),
    query<FarmerIdRecord>(`
      SELECT *
      FROM farmer_ids
      ORDER BY updated_at DESC
      LIMIT 50
    `),
  ]);

  const stats = statsResult.rows[0] || { total: '0', live: '0', draft: '0', claimed: '0' };
  const records = recordsResult.rows;

  const statCards = [
    { label: 'Total FarmID', value: stats.total, note: 'Semua ID petani terdaftar', icon: Fingerprint },
    { label: 'Live Publicly', value: stats.live, note: 'Telah dipublish / lolos KYC', icon: CheckCircle2 },
    { label: 'Draft / Pending', value: stats.draft, note: 'Belum terbit / menunggu verifikasi', icon: ShieldAlert },
    { label: 'Sudah Diklaim', value: stats.claimed, note: 'Telah diklaim oleh petani', icon: Sprout },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            <Eye size={14} />
            FarmID Oversight
          </div>
          <h1 className="mt-3 font-space text-3xl font-extrabold text-white font-space">BPDP & PODGE KYC Oversight</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60">
            Evaluasi berkas dan kualifikasi lahan (KYC) milik Bapak/Ibu petani. Anda masuk sebagai admin verifikator <span className="font-bold text-emerald-200">{admin.role_name}</span>.
          </p>
        </div>
        <Link
          href="/governance/farmid"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-400 font-semibold"
        >
          Buka FarmID Publik
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="glass-panel rounded-lg p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <Icon size={20} />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{card.label}</p>
              <p className="mt-2 font-space text-3xl font-extrabold text-white font-space">{card.value}</p>
              <p className="mt-2 text-xs leading-5 text-emerald-100/55">{card.note}</p>
            </article>
          );
        })}
      </div>

      <section className="rounded-lg border border-emerald-900/60 bg-black/25">
        <div className="border-b border-emerald-900/60 px-5 py-4">
          <h2 className="font-space text-xl font-bold text-emerald-50 font-space">Verifikasi Berkas Lahan (KYC Panel)</h2>
          <p className="mt-1 text-sm text-emerald-200/55">
            Lakukan verifikasi KTP, legalitas sertifikat lahan sawit, dan kualifikasi BPDP untuk me-release kartu identitas digital ke publik.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-900/60 text-[10px] uppercase tracking-widest text-emerald-400 font-mono">
                <th className="px-5 py-3 font-semibold">Petani / FarmID</th>
                <th className="px-5 py-3 font-semibold">Koperasi</th>
                <th className="px-5 py-3 font-semibold">Alamat & Luas</th>
                <th className="px-5 py-3 font-semibold">Status Publik</th>
                <th className="px-5 py-3 font-semibold">Status KYC</th>
                <th className="px-5 py-3 font-semibold">Catatan Audit</th>
                <th className="px-5 py-3 font-semibold text-center">Tindakan KYC</th>
                <th className="px-5 py-3 font-semibold">Tampilan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80">
              {records.map((record) => (
                <tr key={record.farm_id} className="text-emerald-50/85 hover:bg-emerald-950/10">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{record.farmer_name}</p>
                    <p className="font-mono text-[10px] text-emerald-400 mt-0.5">{record.farm_id}</p>
                  </td>
                  <td className="px-5 py-4 text-emerald-100/70">{record.cooperative_name}</td>
                  <td className="px-5 py-4 text-emerald-100/70">
                    <p>{record.village}, {record.district}</p>
                    <p className="text-xs text-emerald-400/65 font-bold mt-0.5">{record.area_hectare} Hektar</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      active={record.public_status === 'live'}
                      activeLabel="Live"
                      inactiveLabel="Draft"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      record.verification_status === 'verified'
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                        : record.verification_status === 'rejected'
                          ? 'border-red-400/40 bg-red-500/15 text-red-300'
                          : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
                    }`}>
                      {record.verification_status === 'verified' ? 'Terverifikasi' :
                       record.verification_status === 'rejected' ? 'Ditolak' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs max-w-[200px] truncate text-emerald-100/60" title={record.verification_note || ''}>
                    {record.verification_note || '-'}
                  </td>
                  
                   {/* KYC Verification Forms */}
                   <td className="px-5 py-4">
                     <form className="flex items-center justify-center gap-2">
                       <input type="hidden" name="farmId" value={record.farm_id} />
                       
                       {record.verification_status === 'pending' ? (
                         <>
                           <input
                             type="text"
                             name="note"
                             required
                             placeholder="Catatan KTP/SHM sesuai..."
                             className="bg-black/40 border border-emerald-950 text-xs px-2.5 py-1.5 rounded-lg outline-none text-emerald-50 placeholder-emerald-900 focus:border-emerald-600 w-44"
                           />
                           <button
                             formAction={verifyKycAction}
                             type="submit"
                             title="Setujui Verifikasi KYC"
                             className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                           >
                             <Check size={14} />
                           </button>
                           <button
                             formAction={rejectKycAction}
                             type="submit"
                             title="Tolak Verifikasi KYC"
                             className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
                           >
                             <X size={14} />
                           </button>
                         </>
                       ) : (
                         <div className="flex items-center gap-2">
                           <input
                             type="text"
                             name="note"
                             placeholder="Alasan reset/evaluasi..."
                             className="bg-black/40 border border-emerald-950 text-xs px-2.5 py-1.5 rounded-lg outline-none text-emerald-50 placeholder-emerald-900 focus:border-emerald-600 w-44"
                           />
                           <button
                             formAction={resetKycAction}
                             type="submit"
                             title="Reset Status Verifikasi ke Pending"
                             className="p-1.5 rounded-lg border border-yellow-700/60 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/50 transition flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                           >
                             <Undo2 size={12} />
                             Reset
                           </button>
                         </div>
                       )}
                     </form>
                   </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/governance/farmid?mode=view&id=${encodeURIComponent(record.farm_id)}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-700/60 px-3 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-950/70"
                    >
                      <Eye size={12} />
                      Lihat Card
                    </Link>
                  </td>
                </tr>
              ))}
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-emerald-200/55">
                    Belum ada FarmID yang terdaftar.
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

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
      active
        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
        : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
    }`}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
