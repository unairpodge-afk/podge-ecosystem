'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, KeyRound, LockKeyhole, QrCode, ShieldAlert } from 'lucide-react';
import type { PublicPodgeIdentityRecord } from '@/lib/identity';

type AccessResult = {
  identity?: PublicPodgeIdentityRecord;
  message?: string;
  error?: string;
};

function getDeviceKey() {
  const storageKey = 'podge:identity:device-key';
  const existing = localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const nextKey = crypto.randomUUID();
  localStorage.setItem(storageKey, nextKey);
  return nextKey;
}

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

export default function IdentityAccessClient() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const queryToken = searchParams.get('token') || '';
  const [publicCode, setPublicCode] = useState(queryId);
  const [token, setToken] = useState(queryToken);
  const [deviceKey, setDeviceKey] = useState('');
  const [result, setResult] = useState<AccessResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDeviceKey(getDeviceKey()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const accessIdentity = useCallback(async (activePublicCode = publicCode, activeToken = token) => {
    if (!deviceKey) {
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await fetch('/api/identity/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicCode: activePublicCode, token: activeToken, deviceKey }),
    });
    const data = await response.json() as AccessResult;
    setLoading(false);
    setResult(data);
  }, [deviceKey, publicCode, token]);

  useEffect(() => {
    if (queryId && queryToken && deviceKey) {
      const frame = requestAnimationFrame(() => {
        void accessIdentity(queryId, queryToken);
      });

      return () => cancelAnimationFrame(frame);
    }

    return undefined;
  }, [accessIdentity, deviceKey, queryId, queryToken]);

  function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void accessIdentity();
  }

  const isFarmer = result?.identity?.identity_type === 'farmer';
  const destinationHref = isFarmer && result.identity?.linked_farm_id
    ? `/governance/farmid?mode=view&id=${encodeURIComponent(result.identity.linked_farm_id)}`
    : '/admin/login';

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
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">QR Identity Access</p>
              </div>
            </Link>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              <QrCode size={14} />
              PODGE-ID Untuk Semua Peran
            </div>
            <h1 className="mt-4 font-space text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Masuk dengan PODGE-ID, tanpa email.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100/65">
              Untuk bapak/ibu petani dan kelompok tani: PODGE-ID adalah kartu identitas digital. QR pribadi disimpan
              sendiri, sedangkan QR publik boleh dibagikan untuk transparansi. Jangan kirim QR pribadi ke orang lain.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['1', 'Scan QR pribadi'],
                ['2', 'Perangkat pertama dikunci'],
                ['3', 'Data publik tetap transparan'],
              ].map(([number, label]) => (
                <div key={number} className="rounded-lg border border-emerald-900/60 bg-black/25 p-4">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-xs font-extrabold text-black">
                    {number}
                  </div>
                  <p className="text-sm leading-6 text-emerald-100/75">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-black">
                <LockKeyhole size={22} />
              </div>
              <div>
                <h2 className="font-space text-2xl font-bold text-emerald-50">Akses PODGE-ID</h2>
                <p className="text-sm text-emerald-200/55">Scan QR pribadi atau isi manual.</p>
              </div>
            </div>

            {result?.message ? (
              <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} />
                  Berhasil
                </div>
                <p className="mt-1">{result.message}</p>
              </div>
            ) : null}

            {result?.error ? (
              <div className="mb-4 rounded-lg border border-yellow-500/35 bg-yellow-950/35 p-4 text-sm leading-6 text-yellow-100">
                <div className="mb-1 flex items-center gap-2 font-bold">
                  <ShieldAlert size={16} />
                  Akses belum bisa dibuka
                </div>
                {result.error}
              </div>
            ) : null}

            <form onSubmit={submitAccess} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-emerald-200/70">PODGE-ID</span>
                <input
                  value={publicCode}
                  onChange={(event) => setPublicCode(event.target.value.toUpperCase())}
                  required
                  className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                  placeholder="PODGE-FARM-2026-XXXX"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-emerald-200/70">Private Token</span>
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  required
                  className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                  placeholder="Token rahasia dari QR pribadi"
                />
              </label>

              <button
                type="submit"
                disabled={loading || !deviceKey}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound size={17} />
                {loading ? 'Membuka akses...' : 'Masuk dengan PODGE-ID'}
              </button>
            </form>

            {result?.identity ? (
              <div className="mt-5 rounded-lg border border-emerald-900/60 bg-black/25 p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Identity Terbuka</p>
                <p className="mt-2 font-space text-xl font-extrabold text-white">{result.identity.display_name}</p>
                <p className="mt-1 text-sm text-emerald-200/65">{identityTypeLabel(result.identity.identity_type)}</p>
                <Link
                  href={destinationHref}
                  className="mt-4 inline-flex w-full justify-center rounded-lg border border-emerald-700/60 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:bg-emerald-950/70"
                >
                  Lanjutkan
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
