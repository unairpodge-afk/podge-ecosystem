import Link from 'next/link';
import { ShieldCheck, FileCheck, Layers, BadgeAlert } from 'lucide-react';
import LoginForm from './login-form';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const initialError = params.error === 'unauthorized'
    ? 'Session valid, tetapi akun ini belum memiliki role verifikator KYC PODGE / BPDP.'
    : undefined;

  return (
    <main className="min-h-screen bg-[#040806] text-emerald-50 web3-grid flex flex-col justify-center">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          
          {/* Left Column: Branding, Cooperation & Image (7 Cols on large screens) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-emerald-950/40 bg-black/60 p-6 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

            {/* Header branding */}
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-lg font-extrabold text-black shadow-[0_0_22px_rgba(16,185,129,0.45)]">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-wider text-emerald-50 font-space">PODGE</span>
                    <span className="text-[10px] font-mono border border-emerald-500/30 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400">BPDPKS PARTNER</span>
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">KYC VERIFICATION SYSTEM</p>
                </div>
              </Link>

              <div className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  <ShieldCheck size={13} className="text-emerald-400 animate-pulse" />
                  Role-Based KYC Authority
                </div>
                <h1 className="mt-4 font-space text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
                  Portal Verifikasi KYC <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    PODGE & BPDP Admin
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-100/70">
                  Konsol verifikasi terintegrasi untuk meninjau legalitas kebun, kelayakan berkas kepemilikan petani (FarmID), serta kepatuhan aspek berkelanjutan ISPO/RSPO. Seluruh aksi persetujuan dan penolakan dicatat secara aman dalam Event Ledger.
                </p>
              </div>
            </div>

            {/* Interactive Image & Stats Container */}
            <div className="mt-8 relative rounded-xl border border-emerald-900/40 bg-black/40 p-4">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-emerald-950 bg-[#060b08] relative group">
                <img 
                  src="/podge_bpdp_kyc_login.png" 
                  alt="PODGE BPDP KYC Portal Mockup" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-black/60 px-2 py-1 rounded w-fit mb-1 border border-emerald-500/20">
                    Live KYC Console Preview
                  </span>
                  <p className="text-xs text-white/80 font-medium font-space">
                    Verifikasi Real-time & Cross-reference Data Satelit Kebun Sawit.
                  </p>
                </div>
              </div>

              {/* Fake Micro-Metrics dashboard panel */}
              <div className="mt-4 grid grid-cols-3 gap-3 pt-2">
                <div className="rounded border border-emerald-950 bg-black/40 p-2 text-center">
                  <p className="text-[10px] text-emerald-400/60 uppercase font-mono">STATUS NODE</p>
                  <p className="font-space text-xs font-bold text-emerald-300">CONNECTED</p>
                </div>
                <div className="rounded border border-emerald-950 bg-black/40 p-2 text-center">
                  <p className="text-[10px] text-emerald-400/60 uppercase font-mono">KYC QUEUE</p>
                  <p className="font-space text-xs font-bold text-emerald-300">ACTIVE</p>
                </div>
                <div className="rounded border border-emerald-950 bg-black/40 p-2 text-center">
                  <p className="text-[10px] text-emerald-400/60 uppercase font-mono">ENCRYPTION</p>
                  <p className="font-space text-xs font-bold text-teal-300">AES-256</p>
                </div>
              </div>
            </div>

            {/* Cooperation Footer */}
            <div className="mt-8 flex items-center gap-6 border-t border-emerald-950/60 pt-4 text-xs text-emerald-400/50">
              <div className="flex items-center gap-2">
                <FileCheck size={14} className="text-emerald-500" />
                <span>ISPO / RSPO Cross-check</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-teal-500" />
                <span>Auditable Event Ledger</span>
              </div>
            </div>

          </div>

          {/* Right Column: Glassmorphism Login Card (5 Cols on large screens) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.05)]">
              {/* Subtle design element */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none rounded-bl-full" />
              
              <div className="mb-6">
                <h2 className="font-space text-2xl font-extrabold text-white">Sign In</h2>
                <p className="mt-2 text-xs leading-relaxed text-emerald-300/60">
                  Gunakan kredensial administrator yang terdaftar di sistem PODGE dan BPDP untuk masuk.
                </p>
              </div>

              <LoginForm initialError={initialError} />

              <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-950/10 p-3.5 text-[11px] leading-relaxed text-yellow-200/80">
                <div className="flex gap-2">
                  <BadgeAlert size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-yellow-300">Pemberitahuan Keamanan:</span> Seluruh aktivitas akses, verifikasi, penolakan, dan perubahan data KYC dicatat pada blockchain/ledger internal untuk kebutuhan audit transparansi BPDPKS.
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-[10px] text-emerald-500/40 font-mono">
                PODGE GOVERNANCE v1.2.0 • BPDPKS SYSTEM INTEGRATION
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
