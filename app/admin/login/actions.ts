'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ensureAdminGovernanceTables, getAdminByUser } from '@/lib/admin-auth';

export type LoginState = {
  error?: string;
};

export async function loginAdmin(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  await ensureAdminGovernanceTables();

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: error?.message || 'Login gagal. Cek email dan password admin.' };
  }

  const admin = await getAdminByUser(data.user);

  if (!admin) {
    await supabase.auth.signOut();
    return { error: 'Akun ini belum terdaftar sebagai admin PODGE atau sedang nonaktif.' };
  }

  redirect('/admin');
}

export async function logoutAdmin() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect('/admin/login');
}
