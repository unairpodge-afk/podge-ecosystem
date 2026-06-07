import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { query } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';

export type AdminRole = {
  role_id: string;
  role_name: string;
  description: string;
  permissions: string[];
};

export type AdminUser = {
  admin_id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
  role_name: string;
  permissions: string[];
};

export async function ensureAdminGovernanceTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_roles (
      role_id TEXT PRIMARY KEY,
      role_name TEXT NOT NULL,
      description TEXT NOT NULL,
      permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_user_id UUID UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role_id TEXT NOT NULL REFERENCES admin_roles(role_id),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS ledger_events (
      event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_admin_id UUID REFERENCES admin_users(admin_id),
      actor_role_id TEXT REFERENCES admin_roles(role_id),
      actor_name TEXT NOT NULL DEFAULT 'System',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      previous_hash TEXT,
      event_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    INSERT INTO admin_roles (role_id, role_name, description, permissions)
    VALUES
      ('super_admin', 'Super Admin', 'Kontrol penuh atas PODGE governance engine.', '["farmid:verify","farmid:reject","ledger:view","traceability:verify","compliance:verify","green_sukuk:verify","admin:manage"]'::jsonb),
      ('farmid_verifier', 'FarmID Verifier', 'Memverifikasi atau menolak identitas petani dan data dasar FarmID.', '["farmid:verify","farmid:reject","ledger:view"]'::jsonb),
      ('koperasi_operator', 'Koperasi Operator', 'Mencatat dan memvalidasi data koperasi serta batch TBS dari petani.', '["traceability:create","traceability:verify","ledger:view"]'::jsonb),
      ('pks_operator', 'PKS Operator', 'Memverifikasi penerimaan batch TBS di pabrik kelapa sawit.', '["traceability:receive","ledger:view"]'::jsonb),
      ('logistics_operator', 'Logistics Operator', 'Memperbarui status pengiriman dan dokumen logistik rantai pasok.', '["traceability:ship","ledger:view"]'::jsonb),
      ('esg_auditor', 'ESG Auditor', 'Memverifikasi kepatuhan ISPO, RSPO, NDPE, dan dokumen ESG.', '["compliance:verify","ledger:view"]'::jsonb),
      ('finance_verifier', 'Finance Verifier', 'Memverifikasi proyek green sukuk dan aktivitas pembiayaan hijau.', '["green_sukuk:verify","ledger:view"]'::jsonb)
    ON CONFLICT (role_id) DO NOTHING
  `);
}

export async function getCurrentSupabaseUser() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function getAdminByUser(user: User) {
  await ensureAdminGovernanceTables();

  const result = await query<AdminUser>(
    `SELECT
      au.admin_id,
      au.auth_user_id::text,
      au.email,
      au.full_name,
      au.role_id,
      au.is_active,
      ar.role_name,
      ar.permissions
    FROM admin_users au
    JOIN admin_roles ar ON ar.role_id = au.role_id
    WHERE au.is_active = true
      AND (au.auth_user_id = $1::uuid OR lower(au.email) = lower($2))
    LIMIT 1`,
    [user.id, user.email || ''],
  );

  const admin = result.rows[0];

  if (!admin) {
    return null;
  }

  if (!admin.auth_user_id) {
    await query('UPDATE admin_users SET auth_user_id = $1, updated_at = NOW() WHERE admin_id = $2', [
      user.id,
      admin.admin_id,
    ]);
    admin.auth_user_id = user.id;
  }

  return admin;
}

export async function requireAdmin() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect('/admin/login');
  }

  const admin = await getAdminByUser(user);

  if (!admin) {
    redirect('/admin/login?error=unauthorized');
  }

  return { user, admin };
}
