import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { appendLedgerEvent } from '@/lib/ledger';
import {
  hashIdentitySecret,
  toPublicIdentity,
  type PodgeIdentityRecord,
} from '@/lib/identity';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  let activeAdmin;

  try {
    const session = await requireAdmin();
    activeAdmin = session.admin;
  } catch {
    return NextResponse.json({ error: 'Akses ditolak. Login admin diperlukan.' }, { status: 401 });
  }

  if (activeAdmin.role_id !== 'super_admin' && !activeAdmin.permissions.includes('admin:manage')) {
    return NextResponse.json({ error: 'Hanya Super Admin yang dapat mengubah status claim anggota.' }, { status: 403 });
  }

  const body = await request.json();
  const identityId = asText(body.identityId);
  const action = asText(body.action);

  if (!identityId || !['claim', 'unclaim'].includes(action)) {
    return NextResponse.json({ error: 'identityId dan action claim/unclaim wajib diisi.' }, { status: 400 });
  }

  const currentResult = await query<PodgeIdentityRecord>(
    'SELECT * FROM podge_identities WHERE identity_id = $1 LIMIT 1',
    [identityId],
  );
  const currentIdentity = currentResult.rows[0];

  if (!currentIdentity) {
    return NextResponse.json({ error: 'PODGE-ID anggota tidak ditemukan.' }, { status: 404 });
  }

  const updateResult = action === 'claim'
    ? await query<PodgeIdentityRecord>(
        `UPDATE podge_identities
         SET is_claimed = true,
             claimed_at = COALESCE(claimed_at, NOW()),
             claimed_device_hash = COALESCE(claimed_device_hash, $2),
             updated_at = NOW()
         WHERE identity_id = $1
         RETURNING *`,
        [identityId, hashIdentitySecret(`admin-claimed:${activeAdmin.admin_id}:${identityId}`)],
      )
    : await query<PodgeIdentityRecord>(
        `UPDATE podge_identities
         SET is_claimed = false,
             claimed_at = NULL,
             claimed_device_hash = NULL,
             updated_at = NOW()
         WHERE identity_id = $1
         RETURNING *`,
        [identityId],
      );

  const updatedIdentity = updateResult.rows[0];

  // Sync to farmer_ids
  if (updatedIdentity.linked_farm_id) {
    if (action === 'claim') {
      await query(
        `UPDATE farmer_ids
         SET is_claimed = true,
             claimed_at = COALESCE(claimed_at, NOW()),
             claimed_device_hash = COALESCE(claimed_device_hash, $2),
             updated_at = NOW()
         WHERE farm_id = $1`,
        [updatedIdentity.linked_farm_id, hashIdentitySecret(`admin-claimed:${activeAdmin.admin_id}:${identityId}`)]
      );
    } else {
      await query(
        `UPDATE farmer_ids
         SET is_claimed = false,
             claimed_at = NULL,
             claimed_device_hash = NULL,
             updated_at = NOW()
         WHERE farm_id = $1`,
        [updatedIdentity.linked_farm_id]
      );
    }
  }

  try {
    await appendLedgerEvent({
      entityType: 'identity',
      entityId: updatedIdentity.public_code,
      action: action === 'claim' ? 'identity.claimed_by_super_admin' : 'identity.unclaimed_by_super_admin',
      actor: {
        adminId: activeAdmin.admin_id,
        roleId: activeAdmin.role_id,
        name: activeAdmin.full_name,
      },
      payload: {
        identity_id: updatedIdentity.identity_id,
        identity_type: updatedIdentity.identity_type,
        linked_farm_id: updatedIdentity.linked_farm_id,
        previous_claimed: currentIdentity.is_claimed,
        current_claimed: updatedIdentity.is_claimed,
      },
    });
  } catch (err) {
    console.error('Ledger append failed during admin member claim update:', err);
  }

  return NextResponse.json({
    success: true,
    identity: toPublicIdentity(updatedIdentity),
    message: action === 'claim'
      ? `${updatedIdentity.display_name} berhasil ditandai claimed oleh Super Admin.`
      : `${updatedIdentity.display_name} berhasil dikembalikan ke unclaimed.`,
  });
}
