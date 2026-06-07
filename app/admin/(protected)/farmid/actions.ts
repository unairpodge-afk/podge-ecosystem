'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';

export async function verifyKyc(farmId: string, note: string) {
  const { admin: activeAdmin } = await requireAdmin();
  try {
    await query(`
      UPDATE farmer_ids
      SET 
        verification_status = 'verified',
        verified_at = NOW(),
        verified_by = $1,
        verification_note = $2,
        public_status = 'live',
        public_live_at = NOW(),
        updated_at = NOW()
      WHERE farm_id = $3
    `, [activeAdmin.admin_id, note, farmId]);
    revalidatePath('/admin/farmid');
    return { success: true };
  } catch (err) {
    console.error('Gagal memverifikasi KYC:', err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function rejectKyc(farmId: string, note: string) {
  const { admin: activeAdmin } = await requireAdmin();
  try {
    await query(`
      UPDATE farmer_ids
      SET 
        verification_status = 'rejected',
        verified_at = NOW(),
        verified_by = $1,
        verification_note = $2,
        updated_at = NOW()
      WHERE farm_id = $3
    `, [activeAdmin.admin_id, note, farmId]);
    revalidatePath('/admin/farmid');
    return { success: true };
  } catch (err) {
    console.error('Gagal menolak KYC:', err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function resetKyc(farmId: string, note: string) {
  try {
    await query(`
      UPDATE farmer_ids
      SET 
        verification_status = 'pending',
        verified_at = NULL,
        verified_by = NULL,
        verification_note = $1,
        updated_at = NOW()
      WHERE farm_id = $2
    `, [note, farmId]);
    revalidatePath('/admin/farmid');
    return { success: true };
  } catch (err) {
    console.error('Gagal me-reset KYC:', err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
