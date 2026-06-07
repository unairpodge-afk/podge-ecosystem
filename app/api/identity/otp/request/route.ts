import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensurePodgeIdentitiesTable, hashIdentitySecret, type PodgeIdentityRecord } from '@/lib/identity';

function maskPhoneNumber(phone: string) {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.length <= 6) return '******';
  const start = trimmed.substring(0, 4);
  const end = trimmed.substring(trimmed.length - 3);
  return `${start}*****${end}`;
}

export async function POST(request: NextRequest) {
  try {
    await ensurePodgeIdentitiesTable();

    const body = await request.json();
    const publicCode = typeof body.publicCode === 'string' ? body.publicCode.trim().toUpperCase() : '';
    const newPhoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';
    const verificationSecret = typeof body.verificationSecret === 'string' ? body.verificationSecret.trim() : '';

    if (!publicCode) {
      return NextResponse.json({ error: 'Farm ID / Public Code wajib diisi.' }, { status: 400 });
    }

    // Cari identitas berdasarkan public code atau linked farm id
    const result = await query<PodgeIdentityRecord>(
      'SELECT * FROM podge_identities WHERE UPPER(public_code) = $1 OR UPPER(linked_farm_id) = $1 LIMIT 1',
      [publicCode]
    );
    const identity = result.rows[0];

    if (!identity) {
      return NextResponse.json({ error: 'PODGE-ID / Farm ID tidak ditemukan.' }, { status: 404 });
    }

    if (!identity.is_active || identity.revoked_at) {
      return NextResponse.json({ error: 'Akun PODGE-ID ini sudah tidak aktif atau dicabut.' }, { status: 403 });
    }

    let phoneNumber = identity.phone_number;
    
    if (!phoneNumber) {
      // Jika nomor HP belum ada di database, minta nomor baru
      if (!newPhoneNumber) {
        return NextResponse.json({
          needsPhoneNumber: true,
          isClaimed: identity.is_claimed,
          message: 'Akun Anda belum terhubung dengan nomor WhatsApp. Silakan hubungkan nomor WhatsApp Anda.'
        });
      }

      // Jika akun sudah pernah diklaim sebelumnya, wajib masukkan token/recovery code sebagai bukti
      if (identity.is_claimed) {
        if (!verificationSecret) {
          return NextResponse.json({
            error: 'Akun ini sudah diklaim di perangkat lain. Masukkan Token Pribadi atau Recovery Code Anda sebagai bukti kepemilikan untuk menghubungkan nomor WhatsApp.'
          }, { status: 401 });
        }

        const secretHash = hashIdentitySecret(verificationSecret);
        const isValid = secretHash === identity.private_token_hash || secretHash === identity.recovery_code_hash;

        if (!isValid) {
          return NextResponse.json({
            error: 'Bukti kepemilikan (Token atau Recovery Code) tidak cocok.'
          }, { status: 403 });
        }
      }

      phoneNumber = newPhoneNumber;
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Simpan ke database
    await query(
      `INSERT INTO podge_otps (identity_id, otp_code, expired_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [identity.identity_id, otpCode]
    );

    // Kirim pesan tiruan ke WhatsApp (Log Konsol)
    console.log(`
============================================================
[MOCK WHATSAPP GATEWAY]
Tujuan WA: ${phoneNumber}
Penerima: ${identity.display_name}
Pesan WA: Kode OTP login PODGE Sawit Anda adalah [ ${otpCode} ]. 
Kode ini rahasia dan berlaku selama 10 menit.
============================================================
    `);

    return NextResponse.json({
      success: true,
      maskedPhone: maskPhoneNumber(phoneNumber || ''),
      // Sertakan OTP di response untuk mempermudah testing lokal
      devOtp: otpCode,
      message: 'Kode akses OTP berhasil dikirim ke nomor WhatsApp Anda.'
    });

  } catch (error) {
    console.error('Error in OTP request API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat memproses OTP.' }, { status: 500 });
  }
}
