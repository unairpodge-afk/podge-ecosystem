'use client';

import { useActionState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { loginAdmin } from './actions';

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(loginAdmin, { error: initialError });

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-lg border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm leading-6 text-red-100">
          {state.error}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm text-emerald-200/70">Email Admin</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
          placeholder="admin@podge.id"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-emerald-200/70">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
          placeholder="Masukkan password Supabase Auth"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <ShieldCheck size={17} className="animate-pulse" /> : <LogIn size={17} />}
        {pending ? 'Memverifikasi...' : 'Masuk Admin Console'}
      </button>
    </form>
  );
}
