import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; 

export async function GET() {
  try {
    // Mengeksekusi query sederhana ke Supabase
    const result = await query('SELECT NOW()');
    
    // Jika berhasil, kembalikan response JSON dengan status 200 (OK)
    return NextResponse.json({
      status: 'success',
      message: 'Koneksi ke Supabase berhasil!',
      timestamp: result.rows[0].now
    }, { status: 200 });

  } catch (error) {
    // Jika gagal, log error di terminal dan kembalikan response 500 (Server Error)
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Gagal terhubung ke Supabase. Cek kembali .env.local Anda.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}