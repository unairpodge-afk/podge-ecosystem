import { Database, Fingerprint, KeyRound, ShieldCheck, Sprout, ClipboardCheck, BookOpen, Scale } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminDashboardPage() {
  const { admin } = await requireAdmin();

  const cards = [
    {
      title: 'FarmID Verification',
      value: 'Oversight Active',
      note: 'FarmID self-publish oleh petani. Admin memonitor status live/draft tanpa menjadi gatekeeper.',
      icon: Fingerprint,
    },
    {
      title: 'Role Access',
      value: admin.role_name,
      note: 'Akses tombol dan aksi mengikuti hak izin peran Anda di sistem PODGE.',
      icon: KeyRound,
    },
    {
      title: 'Ledger Events',
      value: 'Secure Chain',
      note: 'Fondasi hash-chain event aktif mencatat setiap aksi audit secara permanen.',
      icon: Database,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          <ShieldCheck size={14} className="animate-pulse" />
          BPDPKS & PODGE INTEGRATION NODE
        </div>
        <h1 className="mt-3 font-space text-3xl font-extrabold text-white">Admin Governance Console</h1>
        <p className="mt-1 text-sm leading-6 text-emerald-200/60">
          Masuk sebagai <span className="font-bold text-emerald-200">{admin.full_name}</span> dengan otoritas{' '}
          <span className="font-bold text-emerald-300 font-mono">[{admin.role_id}]</span>.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="glass-panel rounded-lg p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <Icon size={21} />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{card.title}</p>
              <p className="mt-2 font-space text-xl font-extrabold text-white">{card.value}</p>
              <p className="mt-2 text-xs leading-5 text-emerald-100/60">{card.note}</p>
            </article>
          );
        })}
      </div>

      {/* BPDPKS Research Tutorial Panel */}
      <section className="rounded-xl border border-emerald-900/60 bg-gradient-to-br from-black/60 to-emerald-950/10 p-6 md:p-8 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-3 border-b border-emerald-950 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="font-space text-xl font-extrabold text-white">Panduan Operasional Verifikasi KYC</h2>
            <p className="text-xs text-emerald-400/70 mt-0.5">Grand Research Sawit • Badan Pengelola Dana Perkebunan Kelapa Sawit (BPDPKS)</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">01</span>
              <h3 className="font-space text-sm font-bold text-emerald-300">Tinjau Legalitas Spasial</h3>
            </div>
            <p className="text-xs leading-relaxed text-emerald-100/60">
              Periksa koordinat lintang/bujur areal kebun sawit rakyat guna memastikan kebun tidak masuk ke dalam kawasan hutan lindung serta tumpang tindih lahan dengan korporasi.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500/40">
              <Sprout size={12} />
              <span>Sertifikasi STDB / SHM</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">02</span>
              <h3 className="font-space text-sm font-bold text-emerald-300">Persetujuan & Rilis Publik</h3>
            </div>
            <p className="text-xs leading-relaxed text-emerald-100/60">
              Gunakan tombol verifikasi untuk mengesahkan data kebun. Saat disetujui, status berubah menjadi <strong>Verified</strong> dan kartu digital (FarmID) diterbitkan secara live.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500/40">
              <ClipboardCheck size={12} />
              <span>Status: verified & live</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">03</span>
              <h3 className="font-space text-sm font-bold text-emerald-300">Auditability & Ledger Event</h3>
            </div>
            <p className="text-xs leading-relaxed text-emerald-100/60">
              Setiap aksi persetujuan, penolakan, dan penulisan catatan wajib mengisi formulir alasan audit. Data ini direkam secara kriptografis anti-tamper demi pertanggungjawaban publik.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500/40">
              <Scale size={12} />
              <span>Immutable Chain Log</span>
            </div>
          </div>
        </div>

        {/* BPDP KS Presentation Note */}
        <div className="mt-8 rounded-lg border border-emerald-950 bg-emerald-950/20 p-4">
          <h4 className="text-xs font-bold text-emerald-300 font-mono uppercase tracking-wide">Tujuan Riset & Manfaat Strategis</h4>
          <p className="mt-2 text-xs leading-relaxed text-emerald-100/70">
            Sistem verifikasi KYC hulu sawit ini dirancang untuk menjawab tantangan kepatuhan regulasi Uni Eropa (EUDR) dan standardisasi ISPO/RSPO. Dengan digitalisasi rantai pasok berbasis data spasial valid yang disahkan BPDPKS, keterlacakan kelapa sawit rakyat dapat dipertanggungjawabkan secara transparan di pasar global.
          </p>
        </div>
      </section>
    </div>
  );
}
