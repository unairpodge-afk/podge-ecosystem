import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  createPodgePrivateToken,
  createPodgePublicCode,
  createPodgeRecoveryCode,
  ensurePodgeIdentitiesTable,
  hashIdentitySecret,
  setIdentitySession,
  toPublicIdentity,
  type PodgeIdentityRecord,
  type PodgeIdentityType,
} from '@/lib/identity';
import { appendLedgerEvent } from '@/lib/ledger';

const allowedRegistrationTypes: PodgeIdentityType[] = ['farmer', 'company', 'investor'];

function isAllowedType(value: unknown): value is PodgeIdentityType {
  return typeof value === 'string' && allowedRegistrationTypes.includes(value as PodgeIdentityType);
}

export async function POST(request: NextRequest) {
  try {
    await ensurePodgeIdentitiesTable();

    const body = await request.json();
    const identityType = body.identityType;
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';

    if (!isAllowedType(identityType)) {
      return NextResponse.json(
        { error: 'Pilih jenis peran pendaftaran yang valid (petani, perusahaan, atau investor).' },
        { status: 400 }
      );
    }

    if (!displayName) {
      return NextResponse.json({ error: 'Nama Lengkap wajib diisi.' }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Nomor HP / WhatsApp wajib diisi.' }, { status: 400 });
    }

    const privateToken = createPodgePrivateToken();
    const recoveryCode = createPodgeRecoveryCode();
    const privateTokenHash = hashIdentitySecret(privateToken);
    const recoveryCodeHash = hashIdentitySecret(recoveryCode);

    // Try generating a unique public code
    for (let attempt = 0; attempt < 5; attempt++) {
      const publicCode = createPodgePublicCode(identityType);

      try {
        const result = await query<PodgeIdentityRecord>(
          `INSERT INTO podge_identities (
            public_code,
            private_token_hash,
            display_name,
            identity_type,
            recovery_code_hash,
            phone_number,
            metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
          RETURNING *`,
          [
            publicCode,
            privateTokenHash,
            displayName,
            identityType,
            recoveryCodeHash,
            phoneNumber,
            JSON.stringify({
              registration_source: 'self_registration',
              registered_at: new Date().toISOString(),
            }),
          ]
        );

        const identity = result.rows[0];

        // Create log event in the ledger
        await appendLedgerEvent({
          entityType: 'identity',
          entityId: identity.public_code,
          action: 'identity.registered',
          actor: { name: displayName },
          payload: {
            identity_id: identity.identity_id,
            identity_type: identity.identity_type,
          },
        });

        // Set the session cookie to automatically log them in
        await setIdentitySession(identity);

        return NextResponse.json({
          success: true,
          identity: toPublicIdentity(identity),
          privateToken,
          message: 'Pendaftaran berhasil.',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!message.includes('duplicate') && !message.includes('unique')) {
          throw err;
        }
      }
    }

    return NextResponse.json({ error: 'Gagal membuat Podge ID yang unik. Silakan coba lagi.' }, { status: 500 });
  } catch (error) {
    console.error('Error during self registration:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat mendaftar.' }, { status: 500 });
  }
}
