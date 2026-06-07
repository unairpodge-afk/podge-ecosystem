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

        {/* NEMESIS AI BANNER (ADMIN) */}
        <div className="mt-8">
          <a href="/governance/ai-agents" className="group glass-panel rounded-xl p-6 border border-emerald-500/50 hover:border-emerald-400 transition flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-emerald-950/60 to-black/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] block cursor-pointer">
            <div className="absolute top-0 right-0 w-64 h-full bg-emerald-500/10 skew-x-12 blur-2xl group-hover:bg-emerald-400/20 transition-colors"></div>
            
            <div className="flex items-center gap-5 z-10 w-full">
              <div className="h-14 w-14 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-pulse"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.224 4.668A4 4 0 0 0 5.876 15 6 6 0 0 0 18 15a4 4 0 0 0 5.097-5.207 4 4 0 0 0-5.224-4.668A3 3 0 1 0 12 5Z"/><path d="M8.5 20c-1.333-1-2.5-1.5-3.5-1.5M15.5 20c1.333-1 2.5-1.5 3.5-1.5"/></svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-white font-space tracking-wide">Nemesis AI / Sentinel Oracle</h4>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest animate-pulse">Live Radar</span>
                </div>
                <p className="text-xs text-emerald-100/70 leading-relaxed max-w-2xl">
                  Buka pusat kendali intelijen siber admin. Awasi mutu TBS nasional, deteksi fraud deforestasi PKS satelit geospasial, dan pantau kesejahteraan petani mandiri secara real-time.
                </p>
              </div>
            </div>
            
            <div className="shrink-0 z-10 mt-4 md:mt-0 self-start md:self-center">
              <div className="flex items-center text-xs font-bold text-black bg-emerald-500 px-4 py-2.5 rounded-lg border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:bg-emerald-400 group-hover:scale-105 transition-all">
                <span>Akses Intelijen Siber</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
          </a>
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
