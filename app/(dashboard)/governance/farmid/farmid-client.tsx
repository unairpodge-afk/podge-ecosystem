'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  QrCode,
  RefreshCcw,
  ShieldAlert,
  Sprout,
} from 'lucide-react';

type FarmerRecord = {
  farm_id: string;
  farmer_name: string;
  cooperative_name: string;
  village: string;
  district: string;
  province: string;
  area_hectare: string | number;
  commodity: string;
  harvest_status: string;
  public_note: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  updated_at: string;
};

type AccessState = {
  tokenValid: boolean;
  canClaim: boolean;
  canEdit: boolean;
  claimedOnThisDevice: boolean;
};

type ApiResult = {
  record?: FarmerRecord;
  privateToken?: string;
  access?: AccessState;
  canEdit?: boolean;
  message?: string;
  error?: string;
};

const emptyAccess: AccessState = {
  tokenValid: false,
  canClaim: false,
  canEdit: false,
  claimedOnThisDevice: false,
};

function getDeviceKey() {
  const storageKey = 'podge:farmid:device-key';
  const existing = localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const nextKey = crypto.randomUUID();
  localStorage.setItem(storageKey, nextKey);
  return nextKey;
}

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(value)}`;
}

export default function FarmIdClient() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const queryToken = searchParams.get('token') || '';
  const queryMode = searchParams.get('mode') || '';
  const [deviceKey, setDeviceKey] = useState('');
  const [record, setRecord] = useState<FarmerRecord | null>(null);
  const [privateToken, setPrivateToken] = useState(queryToken);
  const [access, setAccess] = useState<AccessState>(emptyAccess);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [harvestStatus, setHarvestStatus] = useState('Belum ada update panen');
  const [publicNote, setPublicNote] = useState('');

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDeviceKey(getDeviceKey());
      setOrigin(window.location.origin);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const publicLink = useMemo(() => {
    if (!origin || !record) {
      return '';
    }

    return `${origin}/governance/farmid?mode=view&id=${encodeURIComponent(record.farm_id)}`;
  }, [origin, record]);

  const privateLink = useMemo(() => {
    if (!origin || !record || !privateToken) {
      return '';
    }

    return `${origin}/governance/farmid?mode=claim&id=${encodeURIComponent(record.farm_id)}&token=${encodeURIComponent(privateToken)}`;
  }, [origin, privateToken, record]);

  const readFarmId = useCallback(async (id: string, token = privateToken, activeDeviceKey = deviceKey) => {
    if (!id || !activeDeviceKey) {
      return;
    }

    setLoading(true);
    setError('');

    const response = await fetch(
      `/api/farmid?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&deviceKey=${encodeURIComponent(activeDeviceKey)}`,
    );
    const data = await response.json() as ApiResult;
    setLoading(false);

    if (!response.ok || !data.record) {
      setError(data.error || 'FarmID tidak bisa dibaca.');
      return;
    }

    setRecord(data.record);
    setAccess(data.access || emptyAccess);
    setHarvestStatus(data.record.harvest_status);
    setPublicNote(data.record.public_note || '');
  }, [deviceKey, privateToken]);

  useEffect(() => {
    if (queryId && deviceKey) {
      const frame = requestAnimationFrame(() => {
        void readFarmId(queryId, queryToken, deviceKey);
      });

      return () => cancelAnimationFrame(frame);
    }

    return undefined;
  }, [deviceKey, queryId, queryToken, readFarmId]);

  async function generateFarmId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch('/api/farmid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json() as ApiResult;
    setLoading(false);

    if (!response.ok || !data.record || !data.privateToken) {
      setError(data.error || 'Gagal membuat FarmID.');
      return;
    }

    setRecord(data.record);
    setPrivateToken(data.privateToken);
    setAccess(emptyAccess);
    setHarvestStatus(data.record.harvest_status);
    setPublicNote(data.record.public_note || '');
    setStatus('FarmID dibuat. Simpan barcode private untuk petani, dan bagikan barcode publik untuk transparansi.');
  }

  async function claimFarmId() {
    if (!record || !privateToken || !deviceKey) {
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    const response = await fetch('/api/farmid/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: record.farm_id, token: privateToken, deviceKey }),
    });
    const data = await response.json() as ApiResult;
    setLoading(false);

    if (!response.ok || !data.record) {
      setError(data.error || 'FarmID gagal diklaim.');
      if (data.record) {
        setRecord(data.record);
      }
      return;
    }

    setRecord(data.record);
    setAccess({
      tokenValid: true,
      canClaim: false,
      canEdit: Boolean(data.canEdit),
      claimedOnThisDevice: Boolean(data.canEdit),
    });
    setStatus(data.message || 'FarmID berhasil diklaim.');
  }

  async function updateFarmId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!record || !privateToken || !deviceKey) {
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    const response = await fetch('/api/farmid/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: record.farm_id,
        token: privateToken,
        deviceKey,
        harvestStatus,
        publicNote,
      }),
    });
    const data = await response.json() as ApiResult;
    setLoading(false);

    if (!response.ok || !data.record) {
      setError(data.error || 'Update FarmID ditolak.');
      return;
    }

    setRecord(data.record);
    setStatus(data.message || 'Data publik berhasil diperbarui.');
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setStatus('Link berhasil disalin.');
  }

  const isClaimMode = queryMode === 'claim' && privateToken;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            <Fingerprint size={14} />
            FarmID Key Claiming
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">Private-Public Farmer ID</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60">
            Buat satu barcode private untuk petani dan satu barcode publik untuk masyarakat. Tanpa login:
            hak edit dikunci oleh token rahasia dan perangkat pertama yang melakukan klaim.
          </p>
        </div>
        <Link
          href="/governance/traceability"
          className="inline-flex items-center justify-center rounded-lg border border-emerald-700/60 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:bg-emerald-950/60"
        >
          Kembali ke Ledger
        </Link>
      </div>

      {status ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {status}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-lg p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-black">
              <Sprout size={22} />
            </div>
            <div>
              <h2 className="font-space text-xl font-bold text-emerald-50">Generate ID Petani</h2>
              <p className="text-xs text-emerald-200/55">Data dasar ini akan terlihat di halaman publik.</p>
            </div>
          </div>

          <form onSubmit={generateFarmId} className="grid gap-4">
            <Field label="Nama Petani" name="farmerName" placeholder="Misal: Siti Rahma" required />
            <Field label="Koperasi / Kelompok" name="cooperativeName" placeholder="Misal: KUD Sawit Makmur" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Desa" name="village" placeholder="Desa Sumber Sawit" required />
              <Field label="Kabupaten" name="district" placeholder="Pelalawan" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provinsi" name="province" placeholder="Riau" required />
              <Field label="Luas Lahan (ha)" name="areaHectare" type="number" step="0.01" placeholder="2.50" required />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Generate 2 Barcode FarmID'}
            </button>
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <QrPanel
            title="Barcode Private Petani"
            description="Disimpan petani. Berisi token rahasia untuk klaim dan update data publik dari perangkat pertama."
            icon={Lock}
            link={privateLink}
            tone="private"
            onCopy={copyText}
          />
          <QrPanel
            title="Barcode Publik Masyarakat"
            description="Bisa ditempel di produk/dokumen. Hanya menampilkan data read-only untuk transparansi."
            icon={Eye}
            link={publicLink}
            tone="public"
            onCopy={copyText}
          />
        </section>
      </div>

      <section className="glass-panel rounded-lg p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-space text-xl font-bold text-emerald-50">Status Klaim & Data Publik</h2>
            <p className="mt-1 text-sm text-emerald-200/55">
              Link publik selalu read-only. Fitur update hanya muncul saat token private valid dan perangkat ini adalah pengklaim pertama.
            </p>
          </div>
          {record ? (
            <button
              type="button"
              onClick={() => readFarmId(record.farm_id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700/60 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:bg-emerald-950/60"
            >
              <RefreshCcw size={15} />
              Refresh
            </button>
          ) : null}
        </div>

        {record ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-lg border border-emerald-900/60 bg-black/25 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">FarmID</p>
                  <p className="mt-1 break-all font-space text-2xl font-extrabold text-white">{record.farm_id}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  record.is_claimed
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
                }`}>
                  {record.is_claimed ? 'Sudah Diklaim' : 'Belum Diklaim'}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Info label="Petani" value={record.farmer_name} />
                <Info label="Koperasi" value={record.cooperative_name} />
                <Info label="Lokasi" value={`${record.village}, ${record.district}, ${record.province}`} />
                <Info label="Luas" value={`${record.area_hectare} ha`} />
                <Info label="Komoditas" value={record.commodity} />
                <Info label="Status Panen" value={record.harvest_status} />
              </div>
              {record.public_note ? (
                <div className="mt-3 rounded-lg border border-emerald-900/60 bg-black/20 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Catatan Publik</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/85">{record.public_note}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-emerald-900/60 bg-black/25 p-5">
              <div className="mb-4 flex items-start gap-3">
                <KeyRound className="mt-0.5 text-emerald-300" size={20} />
                <div>
                  <h3 className="font-space text-lg font-bold text-emerald-50">Akses Private</h3>
                  <p className="text-sm leading-6 text-emerald-200/55">
                    Token private tidak disimpan di browser publik. Perangkat pertama yang klaim akan menyimpan kunci lokal.
                  </p>
                </div>
              </div>

              {isClaimMode && access.canClaim ? (
                <button
                  type="button"
                  onClick={claimFarmId}
                  disabled={loading}
                  className="mb-4 w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  Klaim FarmID di Perangkat Ini
                </button>
              ) : null}

              {access.canEdit ? (
                <form onSubmit={updateFarmId} className="space-y-4">
                  <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 size={16} />
                      Perangkat ini punya akses update.
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-sm text-emerald-200/70">Status Panen Publik</span>
                    <select
                      value={harvestStatus}
                      onChange={(event) => setHarvestStatus(event.target.value)}
                      className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-2 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                    >
                      <option>Belum ada update panen</option>
                      <option>Siap Panen</option>
                      <option>Panen Berjalan</option>
                      <option>Terkirim ke Koperasi</option>
                      <option>Terverifikasi</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm text-emerald-200/70">Catatan Publik</span>
                    <textarea
                      value={publicNote}
                      onChange={(event) => setPublicNote(event.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-2 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                      placeholder="Contoh: Panen dijadwalkan minggu kedua, siap diverifikasi koperasi."
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:opacity-60"
                  >
                    Update Data Publik
                  </button>
                </form>
              ) : (
                <div className="rounded-lg border border-yellow-500/25 bg-yellow-950/25 p-4 text-sm leading-6 text-yellow-100/85">
                  <div className="mb-2 flex items-center gap-2 font-bold">
                    <ShieldAlert size={16} />
                    Mode publik / akses terbatas
                  </div>
                  {record.is_claimed
                    ? 'FarmID ini sudah diklaim. Tanpa perangkat pertama dan token private, halaman hanya bisa melihat data publik.'
                    : 'FarmID belum diklaim. Scan barcode private di HP petani untuk membuka tombol klaim.'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-900/60 bg-black/25 p-8 text-center text-sm text-emerald-200/60">
            Generate FarmID baru atau buka link barcode untuk melihat status klaim.
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = 'text',
  step,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-emerald-200/70">{label}</span>
      <input
        type={type}
        step={step}
        name={name}
        required={required}
        className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-2 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
        placeholder={placeholder}
      />
    </label>
  );
}

function QrPanel({
  title,
  description,
  icon: Icon,
  link,
  tone,
  onCopy,
}: {
  title: string;
  description: string;
  icon: typeof Lock;
  link: string;
  tone: 'private' | 'public';
  onCopy: (value: string) => void;
}) {
  const badgeClass = tone === 'private'
    ? 'border-yellow-400/35 bg-yellow-500/10 text-yellow-200'
    : 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200';

  return (
    <article className="glass-panel rounded-lg p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${badgeClass}`}>
          <Icon size={21} />
        </div>
        <div>
          <h2 className="font-space text-lg font-bold text-emerald-50">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-emerald-200/55">{description}</p>
        </div>
      </div>
      {link ? (
        <>
          <div className="rounded-lg border border-emerald-900/70 bg-emerald-50 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl(link)} alt={`QR ${title}`} className="mx-auto h-56 w-56" />
          </div>
          <div className="mt-4 rounded-lg border border-emerald-900/55 bg-black/25 p-3">
            <p className="break-all font-mono text-[11px] leading-5 text-emerald-100/65">{link}</p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(link)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-700/60 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:bg-emerald-950/60"
          >
            <Copy size={15} />
            Salin Link
          </button>
        </>
      ) : (
        <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-emerald-900/70 bg-black/20 text-center text-sm text-emerald-200/45">
          <div>
            <QrCode className="mx-auto mb-3 text-emerald-700" size={28} />
            QR muncul setelah FarmID dibuat.
          </div>
        </div>
      )}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-900/60 bg-black/20 p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-emerald-50">{value}</p>
    </div>
  );
}
