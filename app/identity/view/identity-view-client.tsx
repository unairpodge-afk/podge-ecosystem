'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Fingerprint, ShieldCheck } from 'lucide-react';
import type { PublicPodgeIdentityRecord } from '@/lib/identity';

type ViewResult = {
  identity?: PublicPodgeIdentityRecord;
  error?: string;
};

function identityTypeLabel(type: string) {
  const labels: Record<string, string> = {
    farmer: 'Petani',
    cooperative: 'Koperasi',
    mill: 'PKS / Pabrik',
    auditor: 'Auditor',
    admin: 'Admin',
    logistics: 'Logistik',
    finance: 'Keuangan',
    public_institution: 'Instansi Publik',
  };

  return labels[type] || type;
}

export default function IdentityViewClient() {
  const searchParams = useSearchParams();
  const publicCode = searchParams.get('id') || '';
  const [result, setResult] = useState<ViewResult | null>(null);

  useEffect(() => {
    if (!publicCode) {
      return undefined;
    }

    const frame = requestAnimationFrame(async () => {
      const response = await fetch(`/api/identity/view?id=${encodeURIComponent(publicCode)}`);
      const data = await response.json() as ViewResult;
      setResult(response.ok ? data : { error: data.error || 'PODGE-ID tidak ditemukan.' });
    });

    return () => cancelAnimationFrame(frame);
  }, [publicCode]);

  const identity = result?.identity;

  return (
    <main className="min-h-screen bg-[#040806] text-emerald-50 web3-grid">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-10">
        <div className="w-full rounded-lg border border-emerald-900/60 bg-[#06110b]/85 p-6 shadow-2xl shadow-black/40">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-black">
              <Eye size={22} />
            </div>
            <div>
              <p className="font-space text-2xl font-extrabold text-white">Public PODGE-ID</p>
              <p className="text-xs text-emerald-200/55">Halaman publik ini tidak menampilkan private token.</p>
            </div>
          </div>

          {result?.error ? (
            <div className="rounded-lg border border-red-500/35 bg-red-950/40 p-4 text-sm text-red-100">
              {result.error}
            </div>
          ) : null}

          {identity ? (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Public Code</p>
                <p className="mt-2 break-all font-space text-3xl font-extrabold text-white">{identity.public_code}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Nama" value={identity.display_name} />
                <Info label="Tipe" value={identityTypeLabel(identity.identity_type)} />
                <Info label="Status" value={identity.is_active ? 'Aktif' : 'Tidak aktif'} />
                <Info label="Claim" value={identity.is_claimed ? 'Sudah diklaim' : 'Belum diklaim'} />
              </div>
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100/80">
                <div className="mb-1 flex items-center gap-2 font-bold">
                  <ShieldCheck size={16} />
                  Untuk masyarakat
                </div>
                QR publik boleh dibagikan sebagai tanda identitas. QR pribadi tidak boleh dibagikan karena dipakai untuk akses.
              </div>
            </div>
          ) : !result?.error ? (
            <div className="rounded-lg border border-dashed border-emerald-900/70 bg-black/20 p-8 text-center text-sm text-emerald-200/50">
              <Fingerprint className="mx-auto mb-3 text-emerald-700" size={28} />
              Memuat data PODGE-ID...
            </div>
          ) : null}

          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg border border-emerald-700/60 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:bg-emerald-950/70"
          >
            Kembali ke PODGE
          </Link>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-900/60 bg-black/25 p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-emerald-50">{value}</p>
    </div>
  );
}
