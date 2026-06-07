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

  // Tab can be 'barcode-otp', 'manual-token', or 'recovery'
  type TabType = 'barcode-otp' | 'manual-token' | 'recovery';
  const [activeTab, setActiveTab] = useState<TabType>('barcode-otp');
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

  // OTP process states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  // Phone binding states
  const [needsPhone, setNeedsPhone] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [verificationSecret, setVerificationSecret] = useState('');

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

  const requestOtp = useCallback(async (activePublicCode = publicCode, overridePhone = '', overrideSecret = '') => {
    if (!activePublicCode) {
      setQrError('Silakan masukkan Farm ID / Public Code terlebih dahulu.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    setQrError(null);
    setQrMessage(null);
    setOtpSuccess(null);
    try {
      const response = await fetch('/api/identity/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicCode: activePublicCode,
          phoneNumber: overridePhone || undefined,
          verificationSecret: overrideSecret || undefined
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setOtpError(data.error || 'Gagal mengirimkan kode OTP.');
        return;
      }

      if (data.needsPhoneNumber) {
        setNeedsPhone(true);
        setIsClaimed(!!data.isClaimed);
        setOtpSuccess(data.message || 'Silakan masukkan nomor WhatsApp Anda.');
        return;
      }

      setNeedsPhone(false);
      setOtpSent(true);
      setMaskedPhone(data.maskedPhone || 'nomor HP Anda');
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setOtpSuccess(data.message || 'OTP berhasil dikirim.');
    } catch {
      setOtpError('Terjadi kesalahan jaringan saat meminta OTP.');
    } finally {
      setOtpLoading(false);
    }
  }, [publicCode]);

  const verifyOtp = useCallback(async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || !deviceKey) return;
    setLoading(true);
    setResult(null);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      const response = await fetch('/api/identity/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicCode, otpCode, deviceKey, phoneNumber: newPhone || undefined }),
      });
      const data = await response.json() as AccessResult;
      setLoading(false);
      setResult(data);
      if (!response.ok) {
        setOtpError(data.error || 'Verifikasi OTP gagal.');
      } else {
        setOtpSuccess('Login via OTP berhasil!');
        setNeedsPhone(false);
        setNewPhone('');
        setVerificationSecret('');
      }
    } catch {
      setLoading(false);
      setOtpError('Terjadi kesalahan jaringan saat memproses verifikasi OTP.');
    }
  }, [publicCode, otpCode, deviceKey, newPhone]);

  const handleQrUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrScanning(true);
    setQrMessage(null);
    setQrError(null);
    setOtpError(null);
    setOtpSuccess(null);

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
            if (parsed.publicCode) {
              setPublicCode(parsed.publicCode);
              setQrMessage('Kartu Digital Anggota terdeteksi. Mengirimkan kode OTP...');
              void requestOtp(parsed.publicCode);
            } else {
              setQrError('QR Code terdeteksi tetapi tidak berisi format Farm ID / PODGE-ID yang valid.');
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
  }, [requestOtp]);

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
                onClick={() => { setActiveTab('barcode-otp'); setResult(null); setOtpSent(false); setOtpError(null); setOtpSuccess(null); }}
                className={`flex-1 py-3.5 text-center text-[11px] sm:text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'barcode-otp'
                    ? 'bg-emerald-500/10 text-emerald-300 border-b-2 border-emerald-400'
                    : 'text-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                <QrCode size={14} />
                Barcode / OTP
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('manual-token'); setResult(null); setOtpError(null); setOtpSuccess(null); }}
                className={`flex-1 py-3.5 text-center text-[11px] sm:text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'manual-token'
                    ? 'bg-emerald-500/10 text-emerald-300 border-b-2 border-emerald-400'
                    : 'text-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                <LockKeyhole size={14} />
                Masuk Manual
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('recovery'); setRecoveryResult(null); }}
                className={`flex-1 py-3.5 text-center text-[11px] sm:text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'recovery'
                    ? 'bg-yellow-500/10 text-yellow-300 border-b-2 border-yellow-400'
                    : 'text-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                <RefreshCcw size={14} />
                Ganti HP
              </button>
            </div>

            <div className="p-6">
              {/* ---- BARCODE + OTP TAB ---- */}
              {activeTab === 'barcode-otp' && (
                <>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black shrink-0">
                      <QrCode size={20} />
                    </div>
                    <div>
                      <h2 className="font-space text-lg font-bold text-emerald-50">Masuk via Barcode Kartu</h2>
                      <p className="text-xs text-emerald-200/55">Unggah barcode kartu digital Anda untuk menerima kode OTP.</p>
                    </div>
                  </div>

                  {otpError && (
                    <div className="mb-4 rounded-lg border border-red-500/35 bg-red-950/35 p-4 text-xs leading-5 text-red-100 flex items-start gap-2">
                      <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {otpSuccess && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs leading-5 text-emerald-100 flex items-start gap-2">
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                      <span>{otpSuccess}</span>
                    </div>
                  )}

                  {/* Dev simulated OTP banner */}
                  {devOtp && !result?.identity && (
                    <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-950/25 p-3 text-xs text-yellow-200">
                      <span className="font-bold">🖥️ [Dev Mode] Kode OTP Terkirim:</span>{' '}
                      <code className="font-mono bg-black/40 px-2 py-0.5 rounded border border-yellow-900/30 text-white font-bold select-all">{devOtp}</code>
                    </div>
                  )}

                  {!otpSent ? (
                    needsPhone ? (
                      <div className="space-y-5">
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-950/25 p-4 text-xs text-yellow-200 text-left">
                          <p className="font-semibold text-yellow-400 flex items-center gap-1.5 font-space">
                            <AlertCircle size={15} /> Hubungkan WhatsApp
                          </p>
                          <p className="mt-1 leading-relaxed text-yellow-200/75">
                            Akun PODGE-ID <strong className="text-white font-mono">{publicCode}</strong> belum terhubung ke WhatsApp. Hubungkan nomor WhatsApp aktif Anda untuk menerima kode OTP masuk.
                          </p>
                        </div>

                        {isClaimed && (
                          <div className="rounded-lg border border-red-500/35 bg-red-950/35 p-4 text-xs text-red-200 text-left space-y-1.5">
                            <p className="font-semibold text-red-400 flex items-center gap-1.5 font-space">
                              <ShieldAlert size={15} /> Akun Sudah Diklaim
                            </p>
                            <p className="leading-relaxed text-red-200/75">
                              Karena kartu ini sudah diklaim di perangkat lain, Anda wajib memasukkan <strong>Token Pribadi (Private Token)</strong> atau <strong>Recovery Code</strong> sebagai bukti kepemilikan untuk menghubungkan nomor WhatsApp.
                            </p>
                          </div>
                        )}

                        <form onSubmit={(e) => { e.preventDefault(); void requestOtp(publicCode, newPhone, verificationSecret); }} className="space-y-4">
                          <label className="block text-left">
                            <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                              <MessageSquare size={13} /> Nomor WhatsApp Baru
                            </span>
                            <input
                              type="tel"
                              value={newPhone}
                              onChange={(event) => setNewPhone(event.target.value)}
                              required
                              placeholder="Contoh: 081234567890"
                              className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                            />
                          </label>

                          {isClaimed && (
                            <label className="block text-left">
                              <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-yellow-400 font-semibold flex items-center gap-1.5">
                                <KeyRound size={13} /> Bukti Kepemilikan (Private Token / Recovery Code)
                              </span>
                              <input
                                type="password"
                                value={verificationSecret}
                                onChange={(event) => setVerificationSecret(event.target.value)}
                                required
                                placeholder="Masukkan token rahasia atau recovery code"
                                className="w-full rounded-xl border border-yellow-900/50 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
                              />
                            </label>
                          )}

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNeedsPhone(false);
                                setNewPhone('');
                                setVerificationSecret('');
                                setOtpError(null);
                                setOtpSuccess(null);
                              }}
                              className="flex-1 rounded-xl border border-emerald-900/70 hover:border-emerald-700 text-emerald-400 hover:text-emerald-300 py-3 text-xs font-bold transition text-center"
                            >
                              Batal
                            </button>

                            <button
                              type="submit"
                              disabled={otpLoading || !newPhone || (isClaimed && !verificationSecret)}
                              className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                              {otpLoading ? (
                                <>
                                  <Loader2 className="animate-spin" size={14} />
                                  Mengirim...
                                </>
                              ) : (
                                'Kirim OTP Binding'
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* File Upload zone */}
                        <div className="p-5 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-950/20 text-center relative transition duration-300 hover:border-emerald-500/40 hover:bg-emerald-950/35">
                          <label className="cursor-pointer block">
                            <div className="flex flex-col items-center justify-center space-y-2.5">
                              {qrScanning || otpLoading ? (
                                <Loader2 className="text-emerald-400 animate-spin" size={32} />
                              ) : (
                                <UploadCloud className="text-emerald-400" size={32} />
                              )}
                              <span className="text-xs font-bold text-emerald-100">
                                {qrScanning ? 'Membaca Kartu...' : otpLoading ? 'Meminta OTP...' : 'Unggah Barcode Kartu Anggota'}
                              </span>
                              <span className="text-[10px] text-emerald-400/50 leading-relaxed max-w-[280px] mx-auto">
                                Pilih screenshot / foto Barcode publik dari Kartu Anggota Digital Anda.
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQrUpload}
                              disabled={qrScanning || otpLoading}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {qrMessage && (
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300 text-center animate-pulse">
                            {qrMessage}
                          </div>
                        )}

                        {qrError && (
                          <div className="rounded-lg border border-yellow-500/20 bg-yellow-950/20 p-3 text-xs text-yellow-200 text-center">
                            {qrError}
                          </div>
                        )}

                        <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-emerald-950/60"></div>
                          <span className="flex-shrink mx-4 text-[10px] font-mono text-emerald-400/40 uppercase">Atau Masukkan Manual</span>
                          <div className="flex-grow border-t border-emerald-950/60"></div>
                        </div>

                        {/* Manual public code entry to trigger OTP */}
                        <form onSubmit={(e) => { e.preventDefault(); void requestOtp(); }} className="space-y-4">
                          <label className="block text-left">
                            <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Farm ID / Public Code</span>
                            <input
                              value={publicCode}
                              onChange={(event) => setPublicCode(event.target.value.toUpperCase())}
                              required
                              className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                              placeholder="PODGE-FARM-2026-XXXXXXXX"
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={otpLoading || !publicCode}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                          >
                            {otpLoading ? 'Mengirim OTP...' : 'Kirim OTP Akses'}
                          </button>
                        </form>
                      </div>
                    )
                  ) : (
                    <form onSubmit={verifyOtp} className="space-y-5">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/35 p-4 text-xs text-emerald-200 text-left">
                        <p className="font-semibold text-emerald-400">Kode Akses Terkirim</p>
                        <p className="mt-1 leading-relaxed text-emerald-200/70">
                          Kode OTP rahasia telah dikirim ke nomor WhatsApp Anda di nomor: <strong className="text-white">{maskedPhone}</strong>
                        </p>
                      </div>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Masukkan Kode OTP</span>
                        <input
                          value={otpCode}
                          onChange={(event) => setOtpCode(event.target.value)}
                          required
                          maxLength={6}
                          className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-center text-lg tracking-[0.5em] text-white outline-none transition focus:border-emerald-500"
                          placeholder="------"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 6}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                      </button>

                      <button
                        type="button"
                        onClick={() => void requestOtp(publicCode, newPhone, verificationSecret)}
                        className="w-full text-center text-xs font-semibold text-emerald-400/70 hover:text-emerald-300 transition"
                      >
                        Tidak terima kode? Kirim ulang OTP
                      </button>
                    </form>
                  )}

                  {result?.identity && (
                    <div className="mt-5 rounded-lg border border-emerald-900/60 bg-black/25 p-4 text-left">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Identitas Terbuka</p>
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

              {/* ---- MANUAL TOKEN TAB ---- */}
              {activeTab === 'manual-token' && (
                <>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black shrink-0">
                      <LockKeyhole size={20} />
                    </div>
                    <div>
                      <h2 className="font-space text-xl font-bold text-emerald-50">Masuk Manual (Token)</h2>
                      <p className="text-xs text-emerald-200/55">Masukkan Farm ID beserta Token Akses Anda secara manual.</p>
                    </div>
                  </div>

                  {result?.message && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100 text-left">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <CheckCircle2 size={16} />
                        Berhasil
                      </div>
                      <p>{result.message}</p>
                    </div>
                  )}

                  {result?.error && (
                    <div className="mb-4 rounded-lg border border-yellow-500/35 bg-yellow-950/35 p-4 text-sm leading-6 text-yellow-100 text-left">
                      <div className="mb-1 flex items-center gap-2 font-bold">
                        <ShieldAlert size={16} />
                        Akses belum bisa dibuka
                      </div>
                      <p>{result.error}</p>
                    </div>
                  )}

                  <form onSubmit={submitAccess} className="space-y-4">
                    <label className="block text-left">
                      <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Farm ID atau Public Code</span>
                      <input
                        value={publicCode}
                        onChange={(event) => setPublicCode(event.target.value.toUpperCase())}
                        required
                        className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        placeholder="PODGE-FARM-2026-XXXXXXXX"
                      />
                    </label>

                    <label className="block text-left">
                      <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Private Token</span>
                      <input
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        required
                        className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        placeholder="Token rahasia"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={loading || !deviceKey}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-extrabold text-black transition hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    >
                      <KeyRound size={17} />
                      {loading ? 'Membuka akses...' : 'Masuk dengan Token'}
                    </button>
                  </form>

                  {result?.identity && (
                    <div className="mt-5 rounded-lg border border-emerald-900/60 bg-black/25 p-4 text-left">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Identitas Terbuka</p>
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
