import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('podge_identity_session');
    
    return NextResponse.json({
      success: true,
      message: 'Keluar berhasil.',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Gagal keluar.' }, { status: 500 });
  }
}
