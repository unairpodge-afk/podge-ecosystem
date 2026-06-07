import { Database, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminDashboardPage() {
  const { admin } = await requireAdmin();

  const cards = [
    {
      title: 'FarmID Verification',
      value: 'Oversight',
      note: 'FarmID self-publish oleh petani. Admin memonitor status live/draft tanpa menjadi gatekeeper.',
      icon: Fingerprint,
    },
    {
      title: 'Role Access',
      value: admin.role_id,
      note: 'Akses tombol dan aksi akan mengikuti permission role ini.',
      icon: KeyRound,
    },
    {
      title: 'Ledger Events',
      value: 'Ready',
      note: 'Fondasi hash-chain event sudah ada untuk mencatat aksi admin.',
      icon: Database,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          <ShieldCheck size={14} />
          Authenticated Admin
        </div>
        <h1 className="mt-3 font-space text-3xl font-extrabold text-white">Admin Governance Console</h1>
        <p className="mt-1 text-sm leading-6 text-emerald-200/60">
          Masuk sebagai <span className="font-bold text-emerald-200">{admin.full_name}</span> dengan role{' '}
          <span className="font-bold text-emerald-200">{admin.role_name}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="glass-panel rounded-lg p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <Icon size={21} />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{card.title}</p>
              <p className="mt-2 font-space text-2xl font-extrabold text-white">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-emerald-100/60">{card.note}</p>
            </article>
          );
        })}
      </div>

      <section className="rounded-lg border border-emerald-900/60 bg-black/25 p-6">
        <h2 className="font-space text-xl font-bold text-emerald-50">Cara membuat admin pertama</h2>
        <p className="mt-2 text-sm leading-6 text-emerald-200/60">
          Buat user di Supabase Auth, lalu masukkan email yang sama ke tabel <code>admin_users</code>.
          Setelah login pertama, PODGE otomatis menautkan <code>auth_user_id</code> ke row admin tersebut.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-emerald-900/60 bg-black/40 p-4 text-xs leading-6 text-emerald-100/75">
{`INSERT INTO admin_users (email, full_name, role_id)
VALUES ('admin@podge.id', 'PODGE Super Admin', 'super_admin');`}
        </pre>
      </section>
    </div>
  );
}
