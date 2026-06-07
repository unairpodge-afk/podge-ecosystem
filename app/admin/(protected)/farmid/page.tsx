import Link from 'next/link';
import { CheckCircle2, Eye, Fingerprint, ShieldAlert, Sprout } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { ensureFarmerIdsTable } from '@/lib/farmid';
import FarmIdClient from './farmid-client';

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
    query<any>(`
      SELECT 
        f.*,
        i.identity_id AS identity_uuid,
        i.public_code AS identity_public_code,
        i.display_name AS identity_display_name,
        i.is_claimed AS identity_is_claimed,
        i.claimed_at AS identity_claimed_at,
        i.token_rotated_at AS identity_token_rotated_at,
        i.private_token_hash AS identity_private_token_hash,
        i.recovery_code_hash AS identity_recovery_code_hash,
        i.is_active AS identity_is_active
      FROM farmer_ids f
      LEFT JOIN podge_identities i ON f.identity_id = i.identity_id OR f.farm_id = i.linked_farm_id
      ORDER BY f.updated_at DESC
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
          <h1 className="mt-3 font-space text-3xl font-extrabold text-white">BPDP & PODGE KYC Oversight</h1>
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
              <p className="mt-2 font-space text-3xl font-extrabold text-white">{card.value}</p>
              <p className="mt-2 text-xs leading-5 text-emerald-100/55">{card.note}</p>
            </article>
          );
        })}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-space text-xl font-bold text-emerald-50">Verifikasi Lahan & Klaim Identitas</h2>
          <p className="mt-1 text-sm text-emerald-200/55">
            Lakukan verifikasi berkas, persetujuan KYC, serta kelola status klaim kartu dan rotasi token petani secara terintegrasi.
          </p>
        </div>
        <FarmIdClient initialRecords={records} />
      </section>
    </div>
  );
}
