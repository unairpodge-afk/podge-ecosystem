'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Leaf, 
  LockKeyhole, 
  User, 
  Building2, 
  Coins, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Fingerprint
} from 'lucide-react';

type Tab = 'login' | 'register' | 'success';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  
  // Login states
  const [publicCode, setPublicCode] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register states
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'farmer' | 'company' | 'investor'>('farmer');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Success states
  const [registeredId, setRegisteredId] = useState('');
  const [copied, setCopied] = useState(false);

  // Handle Login
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/identity/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicCode: publicCode.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || 'Gagal masuk. Silakan periksa kembali PODGE-ID Anda.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoginLoading(false);
    }
  }

  // Handle Register
  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    try {
      const response = await fetch('/api/identity/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identityType: role,
          displayName: displayName.trim()
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setRegisterError(data.error || 'Gagal mendaftar. Silakan coba lagi.');
      } else {
        setRegisteredId(data.identity.public_code);
        setActiveTab('success');
      }
    } catch (err) {
      setRegisterError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setRegisterLoading(false);
    }
  }

  // Copy ID to Clipboard
  function copyToClipboard() {
    navigator.clipboard.writeText(registeredId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <main className="min-h-screen bg-[#040806] text-emerald-50 web3-grid relative flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-950/20 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-emerald-900/30">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-[#040806] font-space text-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] transition group-hover:scale-105">
            P
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider font-space bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              PODGE
            </span>
            <span className="text-[9px] block text-emerald-400 font-mono tracking-widest uppercase mt-[-2px]">
              Ecosystem Node
            </span>
          </div>
        </Link>
        <Link href="/" className="text-xs font-mono text-emerald-400/80 hover:text-emerald-300 transition flex items-center gap-1">
          <span>← Kembali ke Landing</span>
        </Link>
      </header>

      {/* Main Container */}
      <section className="relative z-10 flex-grow flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-[500px]">
          
          {activeTab !== 'success' && (
            <div className="flex bg-black/40 p-1 rounded-xl border border-emerald-950/80 mb-6">
              <button
                onClick={() => { setActiveTab('login'); setLoginError(''); }}
                className={`flex-1 py-3 text-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'text-emerald-300/60 hover:text-emerald-100'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => { setActiveTab('register'); setRegisterError(''); }}
                className={`flex-1 py-3 text-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'text-emerald-300/60 hover:text-emerald-100'
                }`}
              >
                Daftar Baru
              </button>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20">
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
                  <LockKeyhole size={22} />
                </div>
                <h2 className="font-space text-2xl font-bold text-white">Akses Ekosistem</h2>
                <p className="text-sm text-emerald-200/50 mt-1">Cukup masukkan PODGE-ID Anda.</p>
              </div>

              {loginError && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-xs flex gap-2.5 text-red-200 items-start">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono tracking-wider text-emerald-400 uppercase mb-2">
                    PODGE-ID Anda
                  </label>
                  <input
                    type="text"
                    required
                    value={publicCode}
                    onChange={(e) => setPublicCode(e.target.value.toUpperCase())}
                    placeholder="PODGE-ID-FARM-XXXX"
                    className="w-full bg-black/50 border border-emerald-900/60 rounded-xl px-4 py-3 text-sm text-emerald-50 placeholder-emerald-800 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-center tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                  {!loginLoading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20">
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
                  <Fingerprint size={22} />
                </div>
                <h2 className="font-space text-2xl font-bold text-white">Buat PODGE-ID</h2>
                <p className="text-sm text-emerald-200/50 mt-1">Daftarkan diri Anda untuk masuk ke jaringan sawit.</p>
              </div>

              {registerError && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-xs flex gap-2.5 text-red-200 items-start">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{registerError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono tracking-wider text-emerald-400 uppercase mb-2">
                    Nama Lengkap / Nama Entitas
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Kelompok Tani Berkah / PT Sawit Jaya"
                    className="w-full bg-black/50 border border-emerald-900/60 rounded-xl px-4 py-3 text-sm text-emerald-50 placeholder-emerald-800 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-emerald-400 uppercase mb-3">
                    Pilih Peran Anda
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* FARMER */}
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                        role === 'farmer'
                          ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          : 'bg-black/30 border-emerald-950 hover:border-emerald-800/55'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        role === 'farmer' ? 'bg-emerald-500 text-black' : 'bg-emerald-950/40 text-emerald-400'
                      }`}>
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          Petani Mandiri / Kelompok Tani
                          {role === 'farmer' && <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <div className="text-xs text-emerald-300/50 mt-0.5">Mendapatkan PODGE-ID-FARM</div>
                      </div>
                    </button>

                    {/* COMPANY */}
                    <button
                      type="button"
                      onClick={() => setRole('company')}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                        role === 'company'
                          ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                          : 'bg-black/30 border-emerald-950 hover:border-emerald-800/55'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        role === 'company' ? 'bg-blue-500 text-black' : 'bg-blue-950/40 text-blue-400'
                      }`}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          Perusahaan / Pabrik PKS / Koperasi
                          {role === 'company' && <span className="text-[9px] font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <div className="text-xs text-blue-300/50 mt-0.5">Mendapatkan PODGE-ID-PERUSAHAAN</div>
                      </div>
                    </button>

                    {/* INVESTOR */}
                    <button
                      type="button"
                      onClick={() => setRole('investor')}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                        role === 'investor'
                          ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          : 'bg-black/30 border-emerald-950 hover:border-emerald-800/55'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        role === 'investor' ? 'bg-amber-500 text-black' : 'bg-amber-950/40 text-amber-400'
                      }`}>
                        <Coins size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          Investor Green Sukuk
                          {role === 'investor' && <span className="text-[9px] font-mono bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <div className="text-xs text-amber-300/50 mt-0.5">Mendapatkan PODGE-ID-INVESTOR</div>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerLoading ? 'Memproses Pendaftaran...' : 'Buat PODGE-ID & Masuk'}
                  {!registerLoading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: REGISTRATION SUCCESS */}
          {activeTab === 'success' && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/25 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              
              <h2 className="font-space text-3xl font-bold text-white">Pendaftaran Berhasil!</h2>
              <p className="text-sm text-emerald-200/60 mt-2 max-w-sm mx-auto">
                Berikut adalah kartu identitas digital Anda. Harap simpan kode ini dengan aman untuk masuk kembali ke sistem.
              </p>

              {/* Identity Virtual Card */}
              <div className="my-6 p-6 rounded-2xl bg-gradient-to-br from-black/80 to-[#0c1c11]/80 border border-emerald-500/30 text-left relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] rounded-full bg-emerald-500/10 blur-xl"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">Nama Lengkap</span>
                    <p className="text-base font-bold text-white font-space mt-0.5">{displayName}</p>
                  </div>
                  <div className="h-7 w-7 rounded bg-emerald-500 text-black flex items-center justify-center font-extrabold text-xs">
                    P
                  </div>
                </div>

                <div className="mt-6">
                  <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">Peran / Role</span>
                  <p className="text-sm font-semibold text-emerald-200/80 capitalize mt-0.5">
                    {role === 'farmer' ? 'Petani Mandiri' : role === 'company' ? 'Perusahaan Sawit' : 'Investor Green Sukuk'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-950/80 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">PODGE-ID</span>
                    <p className="text-lg font-mono font-bold text-white tracking-wider mt-0.5">{registeredId}</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-2.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/20 text-emerald-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Tersalin' : 'Salin ID'}</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Masuk ke Dashboard
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-emerald-900/10 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} PODGE Sawit Indonesia. Decentralized Governance.
      </footer>
    </main>
  );
}
