import { query } from '@/lib/db';
import { Coins, Layers, Leaf, TrendingUp, ArrowUpRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  let totalSukuk = 0;
  let totalTraceability = 0;
  let totalVolume = 0;
  let totalCompliance = 0;

  try {
    const r = await query('SELECT COUNT(*) FROM green_sukuk_projects');
    totalSukuk = parseInt(r.rows[0].count, 10);
  } catch {}

  try {
    const r = await query('SELECT COUNT(*), COALESCE(SUM(tbs_weight_kg), 0) as vol FROM traceability_logs');
    totalTraceability = parseInt(r.rows[0].count, 10);
    totalVolume = parseFloat(r.rows[0].vol);
  } catch {}

  try {
    const r = await query("SELECT COUNT(*) FROM compliance_evaluations WHERE status = 'Terverifikasi'");
    totalCompliance = parseInt(r.rows[0].count, 10);
  } catch {}

  const modules = [
    {
      title: 'Blockchain Traceability',
      description: 'Lacak rantai pasok TBS dari kebun ke pabrik secara real-time dengan enkripsi SHA-256.',
      href: '/governance/traceability',
      icon: Layers,
      stat: `${totalTraceability} Batch`,
      statLabel: 'Total Log Tercatat',
    },
    {
      title: 'Green Sukuk Portfolio',
      description: 'Kelola pendanaan syariah berkelanjutan untuk proyek karbon dan sawit lestari.',
      href: '/value-creation/green-sukuk',
      icon: Coins,
      stat: `${totalSukuk} Proyek`,
      statLabel: 'Total Proyek Aktif',
    },
    {
      title: 'ESG & Compliance',
      description: 'Pantau sertifikasi ISPO/RSPO dan evaluasi kepatuhan lingkungan NDPE.',
      href: '/governance/compliance',
      icon: ShieldCheck,
      stat: `${totalCompliance} Verified`,
      statLabel: 'Entitas Tersertifikasi',
    },
    {
      title: 'Economic Impact',
      description: 'Analisis dampak ekonomi ekosistem sawit berbasis data petani dan koperasi.',
      href: '/impact/economic',
      icon: TrendingUp,
      stat: `${(totalVolume / 1000).toFixed(1)}t`,
      statLabel: 'Total Volume TBS',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-emerald-500 rounded-lg text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]">
          <Leaf size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-50 font-space">PODGE Ecosystem Overview</h1>
          <p className="text-sm text-emerald-200/60 mt-0.5">
            Palm Oil Digital Governance. Ringkasan data ekosistem sawit berkelanjutan Indonesia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Batch TBS', value: totalTraceability, unit: 'Log' },
          { label: 'Volume TBS', value: (totalVolume / 1000).toFixed(1), unit: 'Ton' },
          { label: 'Proyek Green Sukuk', value: totalSukuk, unit: 'Proyek' },
          { label: 'Entitas Terverifikasi', value: totalCompliance, unit: 'Sertifikat' },
        ].map((metric) => (
          <div key={metric.label} className="glass-panel rounded-lg p-5">
            <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">{metric.label}</p>
            <p className="text-3xl font-extrabold text-emerald-50 mt-2 font-space">{metric.value}</p>
            <p className="text-xs text-emerald-200/55 mt-0.5">{metric.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.title}
              href={mod.href}
              className="group glass-panel rounded-lg p-6 flex flex-col justify-between transition-all hover:border-emerald-500/45"
            >
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-50 group-hover:text-emerald-300 transition-colors">{mod.title}</h3>
                  <p className="text-sm text-emerald-200/60 mt-1 leading-relaxed">{mod.description}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-emerald-950/80 pt-4">
                <div>
                  <p className="text-xl font-extrabold text-emerald-50 font-space">{mod.stat}</p>
                  <p className="text-xs text-emerald-200/45">{mod.statLabel}</p>
                </div>
                <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <span>Buka Modul</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
