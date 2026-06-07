'use client';

import { useEffect, useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  RefreshCcw,
  QrCode,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Check,
} from 'lucide-react';

function getDeviceKey() {
  const storageKey = 'podge:identity:device-key';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
  const nextKey = crypto.randomUUID();
  localStorage.setItem(storageKey, nextKey);
  return nextKey;
}

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(value)}`;
}

type Props = {
  publicCode: string;
  farmId?: string | null;
};

type RotateResult = {
  success?: boolean;
  newToken?: string;
  message?: string;
  error?: string;
};

export default function TokenManager({ publicCode, farmId }: Props) {
  const [deviceKey, setDeviceKey] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  const [showCurrentToken, setShowCurrentToken] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [showNewToken, setShowNewToken] = useState(true);
  const [result, setResult] = useState<RotateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDeviceKey(getDeviceKey());
      setOrigin(window.location.origin);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const accessLink = origin && publicCode
    ? `${origin}/identity/access?id=${encodeURIComponent(publicCode)}&token=${encodeURIComponent(newToken || currentToken)}`
    : '';

  async function handleRotate(e: React.FormEvent) {
    e.preventDefault();
    if (!deviceKey || !currentToken) return;

    setLoading(true);
    setResult(null);

    const response = await fetch('/api/identity/rotate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicCode: farmId || publicCode,
        currentToken,
        deviceKey,
      }),
    });
    const data = await response.json() as RotateResult;
    setLoading(false);
    setResult(data);

    if (data.success && data.newToken) {
      setNewToken(data.newToken);
      setCurrentToken('');
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="glass-panel rounded-2xl border border-emerald-500/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-emerald-900/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black shrink-0">
          <KeyRound size={20} />
        </div>
        <div>
          <h2 className="font-space text-lg font-bold text-emerald-50">Kelola Token Akses (QR Pribadi)</h2>
          <p className="text-xs text-emerald-200/55 mt-0.5">
            Ganti private token untuk memperbarui QR login Anda. Token lama akan langsung tidak berlaku.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Status banners */}
        {result?.message && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100 flex items-start gap-2.5">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{result.message}</span>
          </div>
        )}
        {result?.error && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100 flex items-start gap-2.5">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-400" />
            <span>{result.error}</span>
          </div>
        )}

        {/* New token display after rotation */}
        {newToken && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold font-mono uppercase tracking-wider">
              <AlertCircle size={14} />
              Token Baru — Simpan Sekarang (Hanya Tampil Sekali)
            </div>

            <div className="flex items-center gap-2">
              <code className={`flex-1 font-mono text-xs text-yellow-100 bg-black/40 border border-yellow-900/40 rounded-lg p-2.5 break-all ${!showNewToken ? 'blur-sm select-none' : ''}`}>
                {newToken}
              </code>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowNewToken(!showNewToken)}
                  className="p-2 rounded-lg border border-yellow-900/50 bg-black/30 text-yellow-400 hover:text-yellow-200 transition"
                  title={showNewToken ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showNewToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => copyText(newToken)}
                  className="p-2 rounded-lg border border-yellow-900/50 bg-black/30 text-yellow-400 hover:text-yellow-200 transition"
                  title="Salin token"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* QR Code for new access link */}
            {accessLink && (
              <div className="flex items-center gap-4 pt-2">
                <div className="bg-white p-2 rounded-xl shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl(accessLink)} alt="QR Token Baru" className="h-28 w-28" />
                </div>
                <div className="text-xs text-yellow-200/70 leading-relaxed space-y-1">
                  <p className="font-bold text-yellow-300">QR Akses Baru</p>
                  <p>Scan QR ini dari browser/HP Anda untuk login dengan token baru. Jangan dibagikan ke orang lain.</p>
                  <button
                    type="button"
                    onClick={() => copyText(accessLink)}
                    className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-200 font-semibold transition"
                  >
                    <Copy size={12} />
                    Salin Link QR
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rotate form */}
        <form onSubmit={handleRotate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1.5">
              Token Saat Ini (Private Token)
            </label>
            <div className="flex gap-2">
              <input
                type={showCurrentToken ? 'text' : 'password'}
                value={currentToken}
                onChange={(e) => setCurrentToken(e.target.value)}
                required
                placeholder="Masukkan token rahasia yang aktif sekarang"
                className="flex-1 rounded-xl border border-emerald-900/70 bg-black/40 p-3 font-mono text-xs text-emerald-50 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentToken(!showCurrentToken)}
                className="px-3 rounded-xl border border-emerald-900/60 bg-black/30 text-emerald-400 hover:text-emerald-200 transition"
              >
                {showCurrentToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-emerald-400/50">
              Token ini adalah kunci QR Anda yang diterima saat pertama mendaftar.
            </p>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-950/15 p-3 flex items-start gap-2.5 text-xs text-red-200/80">
            <ShieldAlert size={14} className="shrink-0 text-red-400 mt-0.5" />
            <span>
              Setelah token diganti, token lama <strong>langsung tidak berlaku</strong>. Simpan token baru dengan aman sebelum menutup halaman ini.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !deviceKey || !currentToken}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3.5 text-sm font-extrabold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <RefreshCcw size={16} />
            {loading ? 'Memperbarui Token...' : 'Ganti Private Token (QR)'}
          </button>
        </form>

        {/* Identity info */}
        <div className="pt-3 border-t border-emerald-900/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400/60 font-mono uppercase tracking-wider">Public Code</span>
            <div className="flex items-center gap-2">
              <code className="text-emerald-200 font-mono text-xs">{publicCode}</code>
              <button type="button" onClick={() => copyText(publicCode)} className="text-emerald-400/60 hover:text-emerald-300 transition">
                <Copy size={12} />
              </button>
            </div>
          </div>
          {farmId && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400/60 font-mono uppercase tracking-wider">Farm ID</span>
              <code className="text-emerald-200 font-mono text-xs">{farmId}</code>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-emerald-400/40 mt-1">
            <QrCode size={11} />
            <span>Token tidak disimpan di server — hanya hash tersimpan di database.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
