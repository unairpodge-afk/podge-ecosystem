'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Copy, Fingerprint, KeyRound, QrCode, ShieldCheck } from 'lucide-react';
import type { PublicPodgeIdentityRecord, PodgeIdentityType } from '@/lib/identity';

type GenerateResult = {
  identity?: PublicPodgeIdentityRecord;
  privateToken?: string;
  recoveryCode?: string;
  error?: string;
};

const identityOptions: { value: PodgeIdentityType; label: string; description: string }[] = [
  { value: 'farmer', label: 'Farmer', description: 'Petani / pemilik FarmID' },
  { value: 'cooperative', label: 'Cooperative', description: 'Koperasi / kelompok tani' },
  { value: 'mill', label: 'PKS / Mill', description: 'Pabrik kelapa sawit' },
  { value: 'auditor', label: 'Auditor', description: 'Auditor ESG / ISPO / RSPO' },
  { value: 'admin', label: 'Admin', description: 'Admin governance PODGE' },
  { value: 'logistics', label: 'Logistics', description: 'Operator pengiriman' },
  { value: 'finance', label: 'Finance', description: 'Verifier pembiayaan hijau' },
  { value: 'public_institution', label: 'Public Institution', description: 'Instansi publik / regulator' },
];

const roleOptions = [
  { value: '', label: 'Tidak ada role admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'farmid_verifier', label: 'FarmID Verifier' },
  { value: 'koperasi_operator', label: 'Koperasi Operator' },
  { value: 'pks_operator', label: 'PKS Operator' },
  { value: 'logistics_operator', label: 'Logistics Operator' },
  { value: 'esg_auditor', label: 'ESG Auditor' },
  { value: 'finance_verifier', label: 'Finance Verifier' },
];

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(value)}`;
}

export default function IdentityGenerator() {
  const [origin, setOrigin] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOrigin(window.location.origin));
    return () => cancelAnimationFrame(frame);
  }, []);

  const publicLink = useMemo(() => {
    if (!origin || !result?.identity) {
      return '';
    }

    return `${origin}/identity/view?id=${encodeURIComponent(result.identity.public_code)}`;
  }, [origin, result]);

  const privateLink = useMemo(() => {
    if (!origin || !result?.identity || !result.privateToken) {
      return '';
    }

    return `${origin}/identity/access?id=${encodeURIComponent(result.identity.public_code)}&token=${encodeURIComponent(result.privateToken)}`;
  }, [origin, result]);

  async function generateIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch('/api/identity/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json() as GenerateResult;
    setLoading(false);

    if (!response.ok || data.error) {
      setResult({ error: data.error || 'Gagal membuat PODGE-ID.' });
      return;
    }

    setResult(data);
    setStatus('PODGE-ID berhasil dibuat. Simpan private token dan recovery code sekarang.');
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setStatus('Berhasil disalin.');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-panel rounded-lg p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-black">
            <Fingerprint size={22} />
          </div>
          <div>
            <h2 className="font-space text-xl font-bold text-emerald-50">Generate PODGE-ID</h2>
            <p className="text-xs text-emerald-200/55">Identitas QR universal untuk admin, petani, koperasi, PKS, auditor, dan role lainnya.</p>
          </div>
        </div>

        {status ? (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {status}
          </div>
        ) : null}

        {result?.error ? (
          <div className="mb-4 rounded-lg border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {result.error}
          </div>
        ) : null}

        <form onSubmit={generateIdentity} className="grid gap-4">
          <label className="block">
            <span className="mb-1 block text-sm text-emerald-200/70">Tipe Identity</span>
            <select
              name="identityType"
              required
              className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
            >
              {identityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-emerald-200/70">Nama Tampilan</span>
            <input
              name="displayName"
              required
              className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
              placeholder="Misal: PODGE Super Admin / KUD Gelam / PKS Sidoarjo"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-emerald-200/70">Role Admin Opsional</span>
            <select
              name="roleId"
              className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-emerald-200/70">Link FarmID Opsional</span>
            <input
              name="linkedFarmId"
              className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
              placeholder="PODGE-FARM-YYYY-XXXXXXXX"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-emerald-200/70">Catatan Metadata</span>
            <textarea
              name="metadataNote"
              rows={3}
              className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
              placeholder="Catatan internal saat generate identity."
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate PODGE-ID'}
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="glass-panel rounded-lg p-6">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" size={22} />
            <div>
              <h2 className="font-space text-xl font-bold text-emerald-50">Credential Sekali Tampil</h2>
              <p className="text-xs text-emerald-200/55">DB hanya menyimpan hash. Token asli harus disimpan saat dibuat.</p>
            </div>
          </div>

          {result?.identity ? (
            <div className="space-y-4">
              <SecretBlock label="Public Code" value={result.identity.public_code} onCopy={copyText} />
              <SecretBlock label="Private Token" value={result.privateToken || ''} onCopy={copyText} />
              <SecretBlock label="Recovery Code" value={result.recoveryCode || ''} onCopy={copyText} />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-emerald-900/70 bg-black/20 p-8 text-center text-sm text-emerald-200/45">
              Hasil PODGE-ID akan muncul setelah generate.
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <QrPanel title="Private Access QR" link={privateLink} onCopy={copyText} />
          <QrPanel title="Public Identity QR" link={publicLink} onCopy={copyText} />
        </div>
      </section>
    </div>
  );
}

function SecretBlock({ label, value, onCopy }: { label: string; value: string; onCopy: (value: string) => void }) {
  return (
    <div className="rounded-lg border border-emerald-900/60 bg-black/25 p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{label}</p>
      <p className="mt-2 break-all font-mono text-sm leading-6 text-emerald-50">{value || '-'}</p>
      {value ? (
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-700/60 px-3 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-950/70"
        >
          <Copy size={13} />
          Salin
        </button>
      ) : null}
    </div>
  );
}

function QrPanel({ title, link, onCopy }: { title: string; link: string; onCopy: (value: string) => void }) {
  return (
    <article className="glass-panel rounded-lg p-5">
      <div className="mb-4 flex items-center gap-2 text-emerald-300">
        <KeyRound size={18} />
        <h3 className="font-space text-base font-bold text-emerald-50">{title}</h3>
      </div>
      {link ? (
        <>
          <div className="rounded-lg border border-emerald-900/70 bg-emerald-50 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl(link)} alt={`QR ${title}`} className="mx-auto h-52 w-52" />
          </div>
          <p className="mt-3 break-all rounded-lg border border-emerald-900/60 bg-black/25 p-3 font-mono text-[11px] leading-5 text-emerald-100/65">
            {link}
          </p>
          <button
            type="button"
            onClick={() => onCopy(link)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-700/60 px-3 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-950/70"
          >
            <Copy size={13} />
            Salin Link
          </button>
        </>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-emerald-900/70 bg-black/20 text-center text-sm text-emerald-200/45">
          <div>
            <QrCode className="mx-auto mb-3 text-emerald-700" size={28} />
            QR muncul setelah identity dibuat.
          </div>
        </div>
      )}
    </article>
  );
}
