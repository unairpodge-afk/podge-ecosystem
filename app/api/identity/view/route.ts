import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensurePodgeIdentitiesTable, toPublicIdentity, type PodgeIdentityRecord } from '@/lib/identity';

export async function GET(request: NextRequest) {
  await ensurePodgeIdentitiesTable();

  const publicCode = (new URL(request.url).searchParams.get('id') || '').trim().toUpperCase();

  if (!publicCode) {
    return NextResponse.json({ error: 'PODGE-ID wajib diisi.' }, { status: 400 });
  }

  const result = await query<PodgeIdentityRecord>(
    'SELECT * FROM podge_identities WHERE public_code = $1 LIMIT 1',
    [publicCode],
  );
  const identity = result.rows[0];

  if (!identity) {
    return NextResponse.json({ error: 'PODGE-ID tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({ identity: toPublicIdentity(identity) });
}
