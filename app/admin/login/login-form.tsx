'use client';

import { useActionState } from 'react';
import { LogIn, ShieldCheck, Mail, Lock } from 'lucide-react';
import { loginAdmin } from './actions';

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(loginAdmin, { error: initialError });

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs leading-relaxed text-red-200">
          <div className="flex gap-2 items-start">
            <span className="font-bold text-red-400 shrink-0">Gagal:</span>
            <span>{state.error}</span>
          </div>
        </div>
      ) : null}

      {/* Email Field */}
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
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-emerald-50 placeholder-emerald-800/80 outline-none transition"
            placeholder="verifikator@podge.id"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/70">
          Kata Sandi Keamanan
        </label>
        <div className="relative rounded-lg bg-black/50 border border-emerald-900/60 focus-within:border-emerald-400 focus-within:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all duration-300">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500/60">
            <Lock size={16} />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-emerald-50 placeholder-emerald-800/80 outline-none transition"
            placeholder="••••••••••••"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="relative overflow-hidden group inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-3.5 text-sm font-extrabold text-black transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
      >
        {pending ? (
          <ShieldCheck size={18} className="animate-spin text-black" />
        ) : (
          <LogIn size={18} className="text-black transition-transform duration-300 group-hover:translate-x-1" />
        )}
        <span>{pending ? 'Memverifikasi Akses...' : 'Autentikasi & Masuk Konsol'}</span>
      </button>
    </form>
  );
}
