'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Fingerprint,
  LockKeyhole,
  User,
} from 'lucide-react';

type Role = 'farmer' | 'company' | 'investor';

type RegisterResult = {
  success?: boolean;
  identity?: {
    public_code: string;
    display_name: string;
    identity_type: Role;
  };
  privateToken?: string;
  error?: string;
};

const roleOptions: Array<{
  value: Role;
  label: string;
  description: string;
  icon: typeof User;
  activeClass: string;
  iconClass: string;
  inactiveIconClass: string;
}> = [
  {
    value: 'farmer',
    label: 'Petani Mandiri / Kelompok Tani',
    description: 'Mendapatkan PODGE-ID-FARM untuk akses FarmID dan TBS.',
    icon: User,
    activeClass: 'border-emerald-500 bg-emerald-950/25',
    iconClass: 'bg-emerald-500 text-black',
    inactiveIconClass: 'bg-emerald-950/35 text-emerald-400',
  },
  {
    value: 'company',
    label: 'Perusahaan / PKS / Koperasi',
    description: 'Mendapatkan PODGE-ID-PERUSAHAAN untuk operasional ekosistem.',
    icon: Building2,
    activeClass: 'border-blue-500 bg-blue-950/25',
    iconClass: 'bg-blue-500 text-black',
    inactiveIconClass: 'bg-blue-950/35 text-blue-400',
  },
  {
    value: 'investor',
    label: 'Investor Green Sukuk',
    description: 'Mendapatkan PODGE-ID-INVESTOR untuk akses pembiayaan hijau.',
    icon: Coins,
    activeClass: 'border-amber-500 bg-amber-950/25',
    iconClass: 'bg-amber-500 text-black',
    inactiveIconClass: 'bg-amber-950/35 text-amber-400',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [copied, setCopied] = useState('');

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/identity/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityType: role,
          displayName: displayName.trim(),
        }),
      });
      const data = (await response.json()) as RegisterResult;

      if (!response.ok || !data.identity) {
        setError(data.error || 'Gagal mendaftar. Silakan coba lagi.');
        return;
      }

      setResult(data);
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function copyText(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 2500);
  }

  return (
    <main className="min-h-screen bg-[#040806] text-emerald-50 web3-grid">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
          <div className="max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-lg font-extrabold text-black shadow-[0_0_22px_rgba(16,185,129,0.45)]">
                P
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-wider text-emerald-50 font-space">PODGE</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Pendaftaran Identitas</p>
              </div>
            </Link>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              <Fingerprint size={14} />
              Buat PODGE-ID Baru
            </div>
            <h1 className="mt-4 font-space text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Daftar dulu, lalu masuk dengan PODGE-ID.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100/65">
              Halaman ini khusus membuat identitas baru. Setelah berhasil, simpan PODGE-ID dan private token karena
              token asli hanya ditampilkan satu kali.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-black/30 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-950/60"
            >
              <LockKeyhole size={16} />
              Sudah punya PODGE-ID? Masuk
            </Link>
          </div>

          <div className="glass-panel overflow-hidden rounded-2xl border border-emerald-500/20">
            <div className="border-b border-emerald-900/60 bg-black/40 px-6 py-4">
              <h2 className="font-space text-xl font-bold text-emerald-50">Form Daftar PODGE-ID</h2>
              <p className="mt-1 text-xs text-emerald-200/55">Pilih peran dan buat identitas ekosistem.</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-950/25 p-4 text-sm text-red-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {result?.identity ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    <div className="mb-1 flex items-center gap-2 font-bold text-emerald-300">
                      <CheckCircle2 size={16} />
                      Pendaftaran Berhasil
                    </div>
                    <p>Simpan PODGE-ID dan private token di bawah ini sebelum masuk ke dashboard.</p>
                  </div>

                  <CredentialBox
                    label="PODGE-ID"
                    value={result.identity.public_code}
                    copied={copied === 'publicCode'}
                    onCopy={() => copyText(result.identity!.public_code, 'publicCode')}
                  />
                  {result.privateToken && (
                    <CredentialBox
                      label="Private Token"
                      value={result.privateToken}
                      copied={copied === 'privateToken'}
                      onCopy={() => copyText(result.privateToken!, 'privateToken')}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-extrabold text-black transition hover:bg-emerald-400"
                  >
                    Masuk ke Dashboard
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      Nama Lengkap / Nama Entitas
                    </span>
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      required
                      className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                      placeholder="Contoh: Kelompok Tani Berkah"
                    />
                  </label>

                  <div className="space-y-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Pilih Peran</p>
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      const active = role === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRole(option.value)}
                          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                            active
                              ? option.activeClass
                              : 'border-emerald-950 bg-black/30 hover:border-emerald-800/60'
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              active ? option.iconClass : option.inactiveIconClass
                            }`}
                          >
                            <Icon size={20} />
                          </span>
                          <span>
                            <span className="block text-sm font-bold text-white">{option.label}</span>
                            <span className="mt-0.5 block text-xs text-emerald-200/50">{option.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Memproses Pendaftaran...' : 'Buat PODGE-ID'}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CredentialBox({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-900/60 bg-black/30 p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-lg bg-black/45 p-2.5 text-xs text-emerald-50">{value}</code>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-lg border border-emerald-800/60 p-2 text-emerald-300 transition hover:bg-emerald-950/60"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}
