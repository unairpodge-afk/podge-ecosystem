import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { setIdentitySession, type PodgeIdentityRecord } from '@/lib/identity';
import { appendLedgerEvent } from '@/lib/ledger';

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('id');

    if (!targetId) {
      return NextResponse.json({ error: 'Target Identity ID is required' }, { status: 400 });
    }

    const res = await query<PodgeIdentityRecord>(
      'SELECT * FROM podge_identities WHERE identity_id = $1 LIMIT 1',
      [targetId]
    );

    const identity = res.rows[0];

    if (!identity) {
      return NextResponse.json({ error: 'Identity not found' }, { status: 404 });
    }

    // Set identity session (Impersonation)
    await setIdentitySession({
      identity_id: identity.identity_id,
      public_code: identity.public_code
    });

    // Log the intervention
    await appendLedgerEvent({
      entityType: 'identity',
      entityId: identity.public_code,
      action: 'admin.impersonated',
      actor: { adminId: admin.admin_id, roleId: admin.role_id, name: admin.full_name },
      payload: {
        target_identity_id: identity.identity_id,
        target_name: identity.display_name
      }
    });

    // Next.js redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err: any) {
    if (err?.message?.includes('NEXT_REDIRECT')) {
      throw err; // Next.js redirects throw an error
    }
    console.error('Impersonation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
