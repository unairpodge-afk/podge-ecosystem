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
      color: 'emerald',
    },
    {
      title: 'Green Sukuk Portfolio',
      description: 'Kelola pendanaan syariah berkelanjutan untuk proyek karbon dan sawit lestari.',
      href: '/value-creation/green-sukuk',
      icon: Coins,
      stat: `${totalSukuk} Proyek`,
      statLabel: 'Total Proyek Aktif',
      color: 'green',
    },
    {
      title: 'ESG & Compliance',
      description: 'Pantau sertifikasi ISPO/RSPO dan evaluasi kepatuhan lingkungan (NDPE).',
      href: '/governance/compliance',
      icon: ShieldCheck,
      stat: `${totalCompliance} Verified`,
      statLabel: 'Entitas Tersertifikasi',
      color: 'sky',
    },
    {
      title: 'Economic Impact',
      description: 'Analisis dampak ekonomi ekosistem sawit berbasis data petani dan koperasi.',
      href: '/impact/economic',
      icon: TrendingUp,
      stat: `${(totalVolume / 1000).toFixed(1)}t`,
      statLabel: 'Total Volume TBS',
      color: 'amber',
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; badge: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-100 hover:border-emerald-300' },
    green:   { bg: 'bg-green-50',   icon: 'text-green-600',   badge: 'bg-green-100 text-green-700',     border: 'border-green-100 hover:border-green-300' },
    sky:     { bg: 'bg-sky-50',     icon: 'text-sky-600',     badge: 'bg-sky-100 text-sky-700',         border: 'border-sky-100 hover:border-sky-300' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700',     border: 'border-amber-100 hover:border-amber-300' },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-xl">
          <Leaf size={20} className="text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PODGE Ecosystem Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Palm Oil Digital Governance — Ringkasan Data Ekosistem Sawit Berkelanjutan Indonesia
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Batch TBS',      value: totalTraceability,               unit: 'Log'        },
          { label: 'Volume TBS',            value: (totalVolume / 1000).toFixed(1), unit: 'Ton'        },
          { label: 'Proyek Green Sukuk',    value: totalSukuk,                      unit: 'Proyek'     },
          { label: 'Entitas Terverifikasi', value: totalCompliance,                 unit: 'Sertifikat' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{m.label}</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{m.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const c = colorMap[mod.color];
          return (
            <Link
              key={mod.title}
              href={mod.href}
              className={`group bg-white rounded-2xl border ${c.border} shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className={`h-11 w-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon size={22} className={c.icon} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">{mod.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{mod.description}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{mod.stat}</p>
                  <p className="text-xs text-gray-400">{mod.statLabel}</p>
                </div>
                <span className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
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
