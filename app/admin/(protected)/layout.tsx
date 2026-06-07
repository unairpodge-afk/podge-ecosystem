import Link from 'next/link';
import { Eye, Fingerprint, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { logoutAdmin } from '../login/actions';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { admin } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#040806] text-emerald-50 web3-grid">
      <div className="border-b border-emerald-900/60 bg-[#06110b]/90 backdrop-blur-xl">
        <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black">
              <ShieldCheck size={21} />
            </div>
            <div>
              <p className="font-space text-lg font-extrabold tracking-wider text-white">PODGE Admin</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{admin.role_name}</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-800/60 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-950/70"
            >
              <LayoutDashboard size={16} />
              Overview
            </Link>
            <Link
              href="/admin/farmid"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-800/60 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-950/70"
            >
              <Fingerprint size={16} />
              FarmID Oversight
            </Link>
            <Link
              href="/governance/farmid"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-800/60 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-950/70"
            >
              <Eye size={16} />
              Public Page
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-extrabold text-black transition hover:bg-emerald-400"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </nav>
        </header>
      </div>
      <main className="mx-auto max-w-7xl px-5 py-8">
        {children}
      </main>
    </div>
  );
}
