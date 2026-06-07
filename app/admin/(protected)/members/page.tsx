import { query } from '@/lib/db';
import { Users, KeyRound, Copy, QrCode, ShieldCheck, AlertCircle, Eye } from 'lucide-react';
import MembersClient from './members-client';

export const dynamic = 'force-dynamic';

type MemberRow = {
  identity_id: string;
  public_code: string;
  private_token_hash: string;
  display_name: string;
  identity_type: string;
  role_id: string | null;
  linked_farm_id: string | null;
  is_active: boolean;
  is_claimed: boolean;
  claimed_at: string | null;
  recovery_code_hash: string | null;
  token_rotated_at: string | null;
  created_at: string;
  updated_at: string;
};

export default async function AdminMembersPage() {
  let members: MemberRow[] = [];
  let error = '';

  try {
    const res = await query<MemberRow>(
      `SELECT identity_id, public_code, private_token_hash, display_name, identity_type, 
              role_id, linked_farm_id, is_active, is_claimed, claimed_at, recovery_code_hash,
              token_rotated_at, created_at, updated_at
       FROM podge_identities
       ORDER BY created_at DESC`,
    );
    members = res.rows;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          <Users size={14} />
          Super Admin — Member Directory
        </div>
        <h1 className="mt-3 font-space text-3xl font-extrabold text-white">Direktori Anggota PODGE-ID</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60">
          Tampilan lengkap semua identitas yang terdaftar, termasuk token hash dan status klaim perangkat.
          Token yang ditampilkan adalah <strong className="text-emerald-300">hash SHA-256</strong> — bukan token asli (tidak bisa dibalik).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-100 flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
          <span>Gagal memuat data anggota: {error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Anggota', value: members.length, color: 'emerald' },
          { label: 'Sudah Diklaim', value: members.filter(m => m.is_claimed).length, color: 'blue' },
          { label: 'Aktif', value: members.filter(m => m.is_active).length, color: 'green' },
          { label: 'Petani', value: members.filter(m => m.identity_type === 'farmer').length, color: 'amber' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`glass-panel rounded-xl p-4 border border-${color}-900/40`}>
            <p className={`text-[10px] font-mono uppercase tracking-wider text-${color}-400`}>{label}</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-space">{value}</p>
          </div>
        ))}
      </div>

      <MembersClient members={members} />
    </div>
  );
}
