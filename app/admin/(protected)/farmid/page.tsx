import Link from 'next/link';
import { CheckCircle2, Eye, Fingerprint, ShieldAlert, Sprout } from 'lucide-react';
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
    { label: 'Total FarmID', value: stats.total, note: 'Semua ID petani yang terdaftar', icon: Fingerprint },
    { label: 'Live Publicly', value: stats.live, note: 'Dipublish langsung oleh petani', icon: CheckCircle2 },
    { label: 'Draft Publik', value: stats.draft, note: 'Belum ada update publik petani', icon: ShieldAlert },
    { label: 'Sudah Diklaim', value: stats.claimed, note: 'Private QR sudah dipakai perangkat pertama', icon: Sprout },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            <Eye size={14} />
            FarmID Oversight
          </div>
          <h1 className="mt-3 font-space text-3xl font-extrabold text-white">FarmID Public Monitor</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60">
            Monitoring untuk FarmID yang self-published oleh petani. Admin <span className="font-bold text-emerald-200">{admin.role_name}</span> dapat
            melihat status publik tanpa mengubah atau menahan data FarmID petani.
          </p>
        </div>
        <Link
          href="/governance/farmid"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-extrabold text-black transition hover:bg-emerald-400"
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
              <p className="mt-2 font-space text-3xl font-extrabold text-white">{card.value}</p>
              <p className="mt-2 text-xs leading-5 text-emerald-100/55">{card.note}</p>
            </article>
          );
        })}
      </div>

      <section className="rounded-lg border border-emerald-900/60 bg-black/25">
        <div className="border-b border-emerald-900/60 px-5 py-4">
          <h2 className="font-space text-xl font-bold text-emerald-50">Daftar FarmID Terbaru</h2>
          <p className="mt-1 text-sm text-emerald-200/55">
            Halaman ini read-only. Kontrol admin untuk chain governance berikutnya akan diterapkan pada ledger, traceability, compliance, dan pembiayaan.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-900/60 text-[10px] uppercase tracking-widest text-emerald-400">
                <th className="px-5 py-3 font-mono font-semibold">FarmID</th>
                <th className="px-5 py-3 font-mono font-semibold">Petani</th>
                <th className="px-5 py-3 font-mono font-semibold">Koperasi</th>
                <th className="px-5 py-3 font-mono font-semibold">Lokasi</th>
                <th className="px-5 py-3 font-mono font-semibold">Public</th>
                <th className="px-5 py-3 font-mono font-semibold">Claim</th>
                <th className="px-5 py-3 font-mono font-semibold">Status Panen</th>
                <th className="px-5 py-3 font-mono font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80">
              {records.map((record) => (
                <tr key={record.farm_id} className="text-emerald-50/85">
                  <td className="px-5 py-4 font-mono text-xs text-emerald-300">{record.farm_id}</td>
                  <td className="px-5 py-4 font-semibold">{record.farmer_name}</td>
                  <td className="px-5 py-4 text-emerald-100/70">{record.cooperative_name}</td>
                  <td className="px-5 py-4 text-emerald-100/70">
                    {record.village}, {record.district}, {record.province}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      active={record.public_status === 'live'}
                      activeLabel="Live"
                      inactiveLabel="Draft"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      active={record.is_claimed}
                      activeLabel="Claimed"
                      inactiveLabel="Open"
                    />
                  </td>
                  <td className="px-5 py-4 text-emerald-100/70">{record.harvest_status}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/governance/farmid?mode=view&id=${encodeURIComponent(record.farm_id)}`}
                      className="inline-flex rounded-md border border-emerald-700/60 px-3 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-950/70"
                    >
                      Lihat Publik
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
