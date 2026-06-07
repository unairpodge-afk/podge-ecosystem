import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import LoginForm from './login-form';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const initialError = params.error === 'unauthorized'
    ? 'Session valid, tetapi akun ini belum punya role admin PODGE.'
    : undefined;

  return (
    <main className="min-h-screen bg-[#040806] text-emerald-50 web3-grid">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
          <div className="max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-lg font-extrabold text-black shadow-[0_0_22px_rgba(16,185,129,0.45)]">
                P
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-wider text-emerald-50 font-space">PODGE</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Admin Governance Console</p>
              </div>
            </Link>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              <ShieldCheck size={14} />
              Role-Based Verification
            </div>
            <h1 className="mt-4 font-space text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Admin login untuk menaklukkan rantai verifikasi hulu ke hilir.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100/62">
              Admin masuk memakai Supabase Auth, lalu PODGE mengecek role di tabel admin. Setiap aksi verifikasi
              berikutnya akan siap dicatat ke ledger events sebagai jejak tata kelola.
            </p>
          </div>

          <div className="glass-panel rounded-lg p-6">
            <h2 className="font-space text-2xl font-bold text-emerald-50">Masuk Admin</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-200/55">
              Hanya email yang sudah dimasukkan ke tabel <code>admin_users</code> yang bisa masuk sebagai admin.
            </p>
            <div className="mt-6">
              <LoginForm initialError={initialError} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
