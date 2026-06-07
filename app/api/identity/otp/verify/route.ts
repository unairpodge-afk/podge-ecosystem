import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  ensurePodgeIdentitiesTable,
  hashIdentitySecret,
  setIdentitySession,
  toPublicIdentity,
  type PodgeIdentityRecord,
} from '@/lib/identity';
import { appendLedgerEvent } from '@/lib/ledger';

type OtpRecord = {
  otp_id: string;
  otp_code: string;
  expired_at: string | Date;
  is_used: boolean;
};

export async function POST(request: NextRequest) {
  try {
    await ensurePodgeIdentitiesTable();

    const body = await request.json();
    const publicCode = typeof body.publicCode === 'string' ? body.publicCode.trim().toUpperCase() : '';
    const otpCode = typeof body.otpCode === 'string' ? body.otpCode.trim() : '';
    const deviceKey = typeof body.deviceKey === 'string' ? body.deviceKey.trim() : '';

    if (!publicCode || !otpCode || !deviceKey) {
      return NextResponse.json({ error: 'Farm ID, Kode OTP, dan device key wajib diisi.' }, { status: 400 });
    }

    // Cari identitas
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

    // Ambil OTP aktif terakhir untuk identitas ini
    const otpResult = await query<OtpRecord>(
      `SELECT * FROM podge_otps 
       WHERE identity_id = $1 AND is_used = false AND expired_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [identity.identity_id]
    );
    const latestOtp = otpResult.rows[0];

    if (!latestOtp || latestOtp.otp_code !== otpCode) {
      return NextResponse.json({ error: 'Kode OTP tidak cocok atau sudah kadaluwarsa.' }, { status: 403 });
    }

    // Tandai OTP telah digunakan
    await query('UPDATE podge_otps SET is_used = true WHERE otp_id = $1', [latestOtp.otp_id]);

    const deviceHash = hashIdentitySecret(deviceKey);
    let activeIdentity = identity;

    // Klaim / update device hash
    if (!identity.is_claimed) {
      const update = await query<PodgeIdentityRecord>(
        `UPDATE podge_identities
         SET is_claimed = true, claimed_at = NOW(), claimed_device_hash = $2, updated_at = NOW()
         WHERE identity_id = $1
         RETURNING *`,
        [identity.identity_id, deviceHash]
      );
      activeIdentity = update.rows[0];

      await appendLedgerEvent({
        entityType: 'identity',
        entityId: activeIdentity.public_code,
        action: 'identity.claimed',
        actor: { name: 'PODGE OTP Verifier' },
        payload: {
          identity_id: activeIdentity.identity_id,
          identity_type: activeIdentity.identity_type,
          linked_farm_id: activeIdentity.linked_farm_id,
          verification_method: 'otp'
        },
      });
    } else if (identity.claimed_device_hash !== deviceHash) {
      // Pindahkan device secara otomatis jika terverifikasi OTP
      const update = await query<PodgeIdentityRecord>(
        `UPDATE podge_identities
         SET claimed_device_hash = $2, updated_at = NOW()
         WHERE identity_id = $1
         RETURNING *`,
        [identity.identity_id, deviceHash]
      );
      activeIdentity = update.rows[0];

      await appendLedgerEvent({
        entityType: 'identity',
        entityId: activeIdentity.public_code,
        action: 'identity.device_transferred',
        actor: { name: 'PODGE OTP Verifier' },
        payload: {
          identity_id: activeIdentity.identity_id,
          identity_type: activeIdentity.identity_type,
          linked_farm_id: activeIdentity.linked_farm_id,
          transfer_method: 'otp'
        },
      });
    }

    // Buat session cookie
    await setIdentitySession(activeIdentity);

    await appendLedgerEvent({
      entityType: 'identity',
      entityId: activeIdentity.public_code,
      action: 'identity.access_granted',
      actor: { name: 'PODGE OTP Verified Holder' },
      payload: {
        identity_id: activeIdentity.identity_id,
        identity_type: activeIdentity.identity_type,
        linked_farm_id: activeIdentity.linked_farm_id,
        role_id: activeIdentity.role_id,
        access_method: 'otp'
      },
    });

    return NextResponse.json({
      success: true,
      identity: toPublicIdentity(activeIdentity),
      message: 'Akses masuk PODGE-ID via OTP berhasil diverifikasi.'
    });

  } catch (error) {
    console.error('Error in OTP verify API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat memproses verifikasi OTP.' }, { status: 500 });
  }
}
