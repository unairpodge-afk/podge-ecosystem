'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  QrCode,
  RefreshCcw,
  ShieldAlert,
  Mail,
  MessageSquare,
  AlertCircle,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import type { PublicPodgeIdentityRecord } from '@/lib/identity';
import jsQR from 'jsqr';

type AccessResult = {
  identity?: PublicPodgeIdentityRecord;
  message?: string;
  error?: string;
  success?: boolean;
};

type Tab = 'access' | 'recovery';

function getDeviceKey() {
  const storageKey = 'podge:identity:device-key';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
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
    company: 'Perusahaan',
    investor: 'Investor',
  };
  return labels[type] || type;
}

function parseQrContent(text: string): { publicCode?: string; token?: string; isPrivate?: boolean } {
  try {
    const url = new URL(text);
    // Case 1: Private Access Link
    // e.g., /identity/access?id=PODGE-FARM-2026-XXXX&token=xxxxxx
    if (url.searchParams.has('id') && url.searchParams.has('token')) {
      return {
        publicCode: url.searchParams.get('id') || undefined,
        token: url.searchParams.get('token') || undefined,
        isPrivate: true,
      };
    }
    // Case 2: Public Farm ID link or Public Identity view link
    // e.g., /governance/farmid?mode=view&id=PODGE-FARM-2026-XXXX or /identity/view?id=PODGE-ID-FARM-XXXX
    if (url.searchParams.has('id')) {
      return {
        publicCode: url.searchParams.get('id') || undefined,
        isPrivate: false,
      };
    }
  } catch {
    // If it's not a URL, it might be a raw code or token.
    const trimmed = text.trim();
    if (trimmed.startsWith('PODGE-')) {
      return { publicCode: trimmed, isPrivate: false };
    }
    if (trimmed.length > 20) {
      return { token: trimmed, isPrivate: true };
    }
  }
  return {};
}

export default function IdentityAccessClient() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const queryToken = searchParams.get('token') || '';

  const [activeTab, setActiveTab] = useState<Tab>('access');
  const [publicCode, setPublicCode] = useState(queryId);
  const [token, setToken] = useState(queryToken);
  const [deviceKey, setDeviceKey] = useState('');
  const [result, setResult] = useState<AccessResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Recovery tab state
  const [recoveryId, setRecoveryId] = useState(queryId);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<AccessResult | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // QR Upload Scanner State
  const [qrScanning, setQrScanning] = useState(false);
  const [qrMessage, setQrMessage] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDeviceKey(getDeviceKey()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const accessIdentity = useCallback(async (activePublicCode = publicCode, activeToken = token) => {
    if (!deviceKey) return;
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

  const handleQrUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrScanning(true);
    setQrMessage(null);
    setQrError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setQrError('Gagal memproses gambar (canvas context tidak tersedia)');
          setQrScanning(false);
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        try {
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            const parsed = parseQrContent(code.data);
            if (parsed.publicCode && parsed.token) {
              setPublicCode(parsed.publicCode);
              setToken(parsed.token);
              setQrMessage('Barcode Pribadi (Barcode 1) berhasil diverifikasi. Sedang masuk...');
              void accessIdentity(parsed.publicCode, parsed.token);
            } else if (parsed.publicCode) {
              setPublicCode(parsed.publicCode);
              setQrMessage('Barcode Publik (Barcode 2) terdeteksi. Silakan masukkan Private Token Anda secara manual.');
            } else {
              setQrError('QR Code terdeteksi tetapi tidak berisi format PODGE-ID yang didukung.');
            }
          } else {
            setQrError('Tidak dapat mendeteksi Barcode atau QR Code yang valid. Pastikan gambar jelas dan tidak terpotong.');
          }
        } catch {
          setQrError('Terjadi kesalahan saat membaca piksel gambar.');
        } finally {
          setQrScanning(false);
        }
      };
      img.onerror = () => {
        setQrError('Gagal memuat file sebagai gambar.');
        setQrScanning(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [accessIdentity]);

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

  async function submitRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deviceKey) return;
    setRecoveryLoading(true);
    setRecoveryResult(null);
    const response = await fetch('/api/identity/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicCode: recoveryId, recoveryCode, deviceKey }),
    });
    const data = await response.json() as AccessResult;
    setRecoveryLoading(false);
    setRecoveryResult(data);
  }

  const successIdentity = result?.identity || recoveryResult?.identity;
  const isFarmer = successIdentity?.identity_type === 'farmer';
  const destinationHref = isFarmer && successIdentity?.linked_farm_id
    ? `/governance/farmid?mode=view&id=${encodeURIComponent(successIdentity.linked_farm_id)}`
    : '/dashboard';

  return (
    <main className="min-h-screen bg-[#040806] text-emerald-50 web3-grid">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
          {/* Left Column - Explanation */}
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
                ['1', 'Gunakan Farm ID atau Public Code'],
                ['2', 'Masukkan token dari QR pribadi'],
                ['3', 'Ganti perangkat? Gunakan Recovery Code'],
              ].map(([number, label]) => (
                <div key={number} className="rounded-lg border border-emerald-900/60 bg-black/25 p-4">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-xs font-extrabold text-black">
                    {number}
                  </div>
                  <p className="text-sm leading-6 text-emerald-100/75">{label}</p>
                </div>
              ))}
            </div>

            {/* Contact help box */}
            <div className="mt-8 rounded-xl border border-emerald-900/50 bg-black/25 p-5 space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">Butuh Bantuan?</p>
              <div className="flex items-start gap-3 text-sm text-emerald-200/70">
                <Mail size={16} className="shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  Lupa Recovery Code? Kirim email ke{' '}
                  <a href="mailto:unairpodge@gmail.com" className="text-emerald-400 font-semibold hover:text-emerald-300 transition">
                    unairpodge@gmail.com
                  </a>{' '}
                  dengan menyertakan nama dan Farm ID Anda.
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm text-emerald-200/70">
                <MessageSquare size={16} className="shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  Atau gunakan <span className="text-emerald-400 font-semibold">Chatbox Bantuan</span> di pojok kanan bawah halaman ini untuk langsung terhubung dengan Super Admin PODGE.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Form Panel */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-emerald-500/20">

            {/* Tab Switcher */}
            <div className="flex bg-black/40 border-b border-emerald-900/60">
              <button
                type="button"
                onClick={() => { setActiveTab('access'); setResult(null); }}
                className={`flex-1 py-3.5 text-center text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'access'
                    ? 'bg-emerald-500/10 text-emerald-300 border-b-2 border-emerald-400'
                    : 'text-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                <LockKeyhole size={15} />
                Masuk dengan Token
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('recovery'); setRecoveryResult(null); }}
                className={`flex-1 py-3.5 text-center text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'recovery'
                    ? 'bg-yellow-500/10 text-yellow-300 border-b-2 border-yellow-400'
                    : 'text-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                <RefreshCcw size={15} />
                Ganti Perangkat
              </button>
            </div>

            <div className="p-6">
              {/* ---- ACCESS TAB ---- */}
              {activeTab === 'access' && (
                <>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black shrink-0">
                      <LockKeyhole size={20} />
                    </div>
                    <div>
                      <h2 className="font-space text-xl font-bold text-emerald-50">Akses PODGE-ID</h2>
                      <p className="text-xs text-emerald-200/55">Masukkan Farm ID atau Public Code beserta token.</p>
                    </div>
                  </div>

                  {/* File Upload QR Code Scanner */}
                  <div className="mb-5 p-4 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-950/20 text-center relative transition duration-300 hover:border-emerald-500/40 hover:bg-emerald-950/35">
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {qrScanning ? (
                          <Loader2 className="text-emerald-400 animate-spin" size={28} />
                        ) : (
                          <UploadCloud className="text-emerald-400" size={28} />
                        )}
                        <span className="text-xs font-bold text-emerald-100">
                          {qrScanning ? 'Membaca Barcode...' : 'Unggah Barcode / QR Kartu Digital'}
                        </span>
                        <span className="text-[10px] text-emerald-400/50">
                          Pilih atau seret screenshot/gambar QR Pribadi (Barcode 1) untuk masuk otomatis.
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        disabled={qrScanning}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {qrMessage && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                      <span>{qrMessage}</span>
                    </div>
                  )}

                  {qrError && (
                    <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-3 text-xs text-yellow-200 flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0 text-yellow-400" />
                      <span>{qrError}</span>
                    </div>
                  )}

                  {result?.message && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <CheckCircle2 size={16} />
                        Berhasil
                      </div>
                      <p>{result.message}</p>
                    </div>
                  )}

                  {result?.error && (
                    <div className="mb-4 rounded-lg border border-yellow-500/35 bg-yellow-950/35 p-4 text-sm leading-6 text-yellow-100">
                      <div className="mb-1 flex items-center gap-2 font-bold">
                        <ShieldAlert size={16} />
                        Akses belum bisa dibuka
                      </div>
                      <p>{result.error}</p>
                      {result.error.includes('perangkat pertama') && (
                        <p className="mt-2 text-xs text-yellow-300/70">
                          💡 Gunakan tab <strong>&quot;Ganti Perangkat&quot;</strong> di atas dengan Recovery Code untuk pindah akses ke browser/HP ini.
                        </p>
                      )}
                    </div>
                  )}

                  <form onSubmit={submitAccess} className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Farm ID atau Public Code</span>
                      <input
                        value={publicCode}
                        onChange={(event) => setPublicCode(event.target.value.toUpperCase())}
                        required
                        className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        placeholder="PODGE-FARM-2026-XXXXXXXX"
                      />
                      <p className="mt-1 text-[10px] text-emerald-400/50">Masukkan Farm ID (e.g. PODGE-FARM-2026-54D5D309) atau Public Code (PODGE-ID-FARM-...)</p>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Private Token</span>
                      <input
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        required
                        className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        placeholder="Token rahasia dari QR pribadi"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={loading || !deviceKey}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-extrabold text-black transition hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    >
                      <KeyRound size={17} />
                      {loading ? 'Membuka akses...' : 'Masuk dengan PODGE-ID'}
                    </button>
                  </form>

                  {result?.identity && (
                    <div className="mt-5 rounded-lg border border-emerald-900/60 bg-black/25 p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Identity Terbuka</p>
                      <p className="mt-2 font-space text-xl font-extrabold text-white">{result.identity.display_name}</p>
                      <p className="mt-1 text-sm text-emerald-200/65">{identityTypeLabel(result.identity.identity_type)}</p>
                      {result.identity.linked_farm_id && (
                        <p className="mt-1 text-xs font-mono text-emerald-400/70">Farm ID: {result.identity.linked_farm_id}</p>
                      )}
                      <Link
                        href={destinationHref}
                        className="mt-4 inline-flex w-full justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 text-sm font-bold transition"
                      >
                        Lanjutkan ke Dashboard
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* ---- RECOVERY TAB ---- */}
              {activeTab === 'recovery' && (
                <>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-black shrink-0">
                      <RefreshCcw size={20} />
                    </div>
                    <div>
                      <h2 className="font-space text-xl font-bold text-emerald-50">Pemulihan Perangkat</h2>
                      <p className="text-xs text-emerald-200/55">Gunakan Recovery Code untuk pindah akses ke perangkat ini.</p>
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-950/20 p-3 flex items-start gap-2.5 text-xs text-yellow-200/80">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-yellow-400" />
                    <span>
                      Recovery Code diberikan satu kali saat FarmID atau PODGE-ID pertama dibuat. Jika tidak tercatat, hubungi Super Admin.
                    </span>
                  </div>

                  {recoveryResult?.message && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <CheckCircle2 size={16} />
                        Pemulihan Berhasil
                      </div>
                      <p>{recoveryResult.message}</p>
                    </div>
                  )}

                  {recoveryResult?.error && (
                    <div className="mb-4 rounded-lg border border-red-500/35 bg-red-950/35 p-4 text-sm text-red-100">
                      <div className="mb-1 flex items-center gap-2 font-bold">
                        <ShieldAlert size={16} />
                        Pemulihan Gagal
                      </div>
                      <p>{recoveryResult.error}</p>
                    </div>
                  )}

                  <form onSubmit={submitRecovery} className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Farm ID atau Public Code</span>
                      <input
                        value={recoveryId}
                        onChange={(event) => setRecoveryId(event.target.value.toUpperCase())}
                        required
                        className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        placeholder="PODGE-FARM-2026-XXXXXXXX"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-yellow-400 font-semibold">Recovery Code</span>
                      <input
                        value={recoveryCode}
                        onChange={(event) => setRecoveryCode(event.target.value)}
                        required
                        className="w-full rounded-xl border border-yellow-900/50 bg-black/40 p-3 font-mono text-sm text-yellow-50 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
                        placeholder="Kode pemulihan dari saat FarmID dibuat"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={recoveryLoading || !deviceKey}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3.5 text-sm font-extrabold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                    >
                      <RefreshCcw size={17} />
                      {recoveryLoading ? 'Memulihkan akses...' : 'Pulihkan Perangkat Ini'}
                    </button>
                  </form>

                  {recoveryResult?.identity && (
                    <div className="mt-5 rounded-lg border border-emerald-900/60 bg-black/25 p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Identitas Dipulihkan</p>
                      <p className="mt-2 font-space text-xl font-extrabold text-white">{recoveryResult.identity.display_name}</p>
                      <p className="mt-1 text-sm text-emerald-200/65">{identityTypeLabel(recoveryResult.identity.identity_type)}</p>
                      {recoveryResult.identity.linked_farm_id && (
                        <p className="mt-1 text-xs font-mono text-emerald-400/70">Farm ID: {recoveryResult.identity.linked_farm_id}</p>
                      )}
                      <Link
                        href={destinationHref}
                        className="mt-4 inline-flex w-full justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 text-sm font-bold transition"
                      >
                        Lanjutkan ke Dashboard
                      </Link>
                    </div>
                  )}

                  {/* Support Contact */}
                  {!recoveryResult?.success && (
                    <div className="mt-5 rounded-xl border border-emerald-900/50 bg-black/25 p-4 space-y-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/70 font-semibold">Lupa Recovery Code?</p>
                      <div className="flex items-start gap-2.5 text-xs text-emerald-200/60">
                        <Mail size={13} className="shrink-0 text-emerald-400 mt-0.5" />
                        <span>
                          Email ke{' '}
                          <a href="mailto:unairpodge@gmail.com" className="text-emerald-400 font-semibold hover:underline">
                            unairpodge@gmail.com
                          </a>{' '}
                          dengan nama + Farm ID.
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-emerald-200/60">
                        <MessageSquare size={13} className="shrink-0 text-emerald-400 mt-0.5" />
                        <span>
                          Atau gunakan <span className="text-emerald-300 font-semibold">Chatbox Bantuan</span> di pojok kanan bawah halaman ini.
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Chatbox Button */}
      <a
        href="mailto:unairpodge@gmail.com?subject=Bantuan%20Recovery%20PODGE-ID"
        title="Hubungi Super Admin"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-110 transition-all duration-200 group"
      >
        <MessageSquare size={24} />
        <span className="absolute right-16 whitespace-nowrap rounded-lg bg-black/80 border border-emerald-900/60 px-3 py-1.5 text-xs text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Hubungi Super Admin
        </span>
      </a>
    </main>
  );
}
