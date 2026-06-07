'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck, Mail, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { sendOtpAction, verifyOtpAction } from './actions';

export default function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setPending(true);
    setError('');
    setDevOtp(null);

    const result = await sendOtpAction(email);
    setPending(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      if (result.devOtp) {
        setDevOtp(result.devOtp);
      }
      setStep(2);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;

    setPending(true);
    setError('');

    const result = await verifyOtpAction(email, code);
    if (result.error) {
      setPending(false);
      setError(result.error);
    } else if (result.success) {
      // Redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs leading-relaxed text-red-200">
          <div className="flex gap-2 items-start">
            <span className="font-bold text-red-400 shrink-0">Gagal:</span>
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {/* Dev OTP Bypass Toast/Alert */}
      {devOtp && step === 2 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-4 py-3.5 text-xs leading-relaxed text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-pulse">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-emerald-400 font-mono tracking-wide uppercase text-[10px]">
              🔑 SYSTEM OTP BYPASS (MODUL DEMO)
            </span>
            <span>
              Kode verifikasi telah dihasilkan. Masukkan kode berikut untuk masuk langsung:
            </span>
            <span className="mt-1 font-space text-lg font-extrabold text-white tracking-widest bg-emerald-900/40 px-3 py-1 rounded w-fit border border-emerald-500/20">
              {devOtp}
            </span>
          </div>
        </div>
      )}

      {step === 1 ? (
        /* Step 1: Send OTP Email */
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/70">
              Email Admin Verifikator
            </label>
            <div className="relative rounded-lg bg-black/50 border border-emerald-900/60 focus-within:border-emerald-400 focus-within:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500/60">
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-emerald-50 placeholder-emerald-800/80 outline-none transition"
                placeholder="unairpodge@gmail.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="relative overflow-hidden group inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-3.5 text-sm font-extrabold text-black transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {pending ? (
              <RefreshCw size={18} className="animate-spin text-black" />
            ) : (
              <ShieldCheck size={18} className="text-black transition-transform duration-300 group-hover:scale-11" />
            )}
            <span>{pending ? 'Mengirim OTP...' : 'Kirim Kode Verifikasi'}</span>
          </button>
        </form>
      ) : (
        /* Step 2: Verify OTP Code */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/70">
                Kode OTP Verifikasi
              </span>
              <span className="text-[11px] text-emerald-500/60 font-mono">
                {email}
              </span>
            </div>
            <div className="relative rounded-lg bg-black/50 border border-emerald-900/60 focus-within:border-emerald-400 focus-within:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500/60">
                <Lock size={16} />
              </div>
              <input
                id="code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-emerald-50 placeholder-emerald-800/80 outline-none transition tracking-widest font-space font-bold text-center"
                placeholder="123456"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode('');
                setError('');
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-900/60 hover:bg-emerald-950/20 px-4 py-3.5 text-xs font-semibold text-emerald-300 transition duration-300 hover:text-emerald-50"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>

            <button
              type="submit"
              disabled={pending}
              className="relative overflow-hidden flex-1 group inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-3.5 text-sm font-extrabold text-black transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {pending ? (
                <ShieldCheck size={18} className="animate-spin text-black" />
              ) : (
                <LogIn size={18} className="text-black transition-transform duration-300 group-hover:translate-x-0.5" />
              )}
              <span>{pending ? 'Memverifikasi...' : 'Autentikasi & Masuk'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
