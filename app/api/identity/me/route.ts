import { NextRequest, NextResponse } from 'next/server';
import { getIdentitySession, toPublicIdentity } from '@/lib/identity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const identity = await getIdentitySession();
    if (!identity) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: toPublicIdentity(identity),
    });
  } catch (error) {
    console.error('Error in /api/identity/me:', error);
    return NextResponse.json({ user: null, error: 'Failed to retrieve session' }, { status: 500 });
  }
}
