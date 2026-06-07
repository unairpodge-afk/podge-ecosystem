import { Suspense } from 'react';
import Link from 'next/link';
import IdentityAccessClient from '@/app/identity/access/access-client';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="relative">
      <div className="absolute right-5 top-5 z-50 flex flex-wrap justify-end gap-2">
        <Link
          href="/register"
          className="rounded-lg border border-emerald-700/60 bg-black/45 px-4 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-950/70"
        >
          Daftar Baru
        </Link>
      </div>
      <Suspense fallback={<div className="min-h-screen bg-[#040806] text-emerald-50">Memuat login...</div>}>
        <IdentityAccessClient />
      </Suspense>
    </div>
  );
}
