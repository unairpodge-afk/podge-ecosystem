'use client';

import { useState } from 'react';
import {
  Copy,
  Eye,
  EyeOff,
  Search,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  KeyRound,
  User,
  RefreshCcw,
  Loader2,
} from 'lucide-react';

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

type ResetResult = {
  success?: boolean;
  newToken?: string;
  publicCode?: string;
  displayName?: string;
  message?: string;
  error?: string;
};

type ClaimResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

const TYPE_LABELS: Record<string, string> = {
  farmer: 'Petani',
  cooperative: 'Koperasi',
  mill: 'PKS',
  auditor: 'Auditor',
  admin: 'Admin',
  logistics: 'Logistik',
  finance: 'Keuangan',
  public_institution: 'Instansi Publik',
  company: 'Perusahaan',
  investor: 'Investor',
};

const TYPE_COLORS: Record<string, string> = {
  farmer: 'emerald',
  cooperative: 'teal',
  mill: 'blue',
  auditor: 'purple',
  admin: 'red',
  logistics: 'orange',
  finance: 'yellow',
  public_institution: 'cyan',
  company: 'blue',
  investor: 'amber',
};

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(value)}`;
}

function accessLink(origin: string, publicCode: string, token: string) {
  return `${origin}/identity/access?id=${encodeURIComponent(publicCode)}&token=${encodeURIComponent(token)}`;
}

export default function MembersClient({ members }: { members: MemberRow[] }) {
  const [memberRows, setMemberRows] = useState(members);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleHashes, setVisibleHashes] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // reset token state: keyed by identity_id
  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [resetResults, setResetResults] = useState<Record<string, ResetResult>>({});
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState<string | null>(null);
  const [claimResults, setClaimResults] = useState<Record<string, ClaimResult>>({});

  const filtered = memberRows.filter((m) => {
    const matchSearch =
      !search ||
      m.display_name.toLowerCase().includes(search.toLowerCase()) ||
      m.public_code.toLowerCase().includes(search.toLowerCase()) ||
      (m.linked_farm_id || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || m.identity_type === filterType;
    return matchSearch && matchType;
  });

  function toggleHash(id: string) {
    setVisibleHashes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function handleResetToken(identityId: string) {
    if (confirmReset !== identityId) {
      setConfirmReset(identityId);
      return;
    }
    setConfirmReset(null);
    setResetLoading(identityId);
    setResetResults((prev) => ({ ...prev, [identityId]: {} }));

    try {
      const resp = await fetch('/api/admin/reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId }),
      });
      const data = await resp.json() as ResetResult;
      setResetResults((prev) => ({ ...prev, [identityId]: data }));
    } catch {
      setResetResults((prev) => ({
        ...prev,
        [identityId]: { error: 'Gagal menghubungi server.' },
      }));
    }
    setResetLoading(null);
  }

  async function handleClaimStatus(identityId: string, action: 'claim' | 'unclaim') {
    setClaimLoading(identityId);
    setClaimResults((prev) => ({ ...prev, [identityId]: {} }));

    try {
      const resp = await fetch('/api/admin/members/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId, action }),
      });
      const data = await resp.json() as ClaimResult & { identity?: Partial<MemberRow> };
      setClaimResults((prev) => ({ ...prev, [identityId]: data }));

      if (resp.ok && data.identity) {
        setMemberRows((prev) => prev.map((member) => (
          member.identity_id === identityId
            ? {
                ...member,
                is_claimed: Boolean(data.identity?.is_claimed),
                claimed_at: (data.identity?.claimed_at as string | null | undefined) || null,
                updated_at: (data.identity?.updated_at as string | undefined) || member.updated_at,
              }
            : member
        )));
      }
    } catch {
      setClaimResults((prev) => ({
        ...prev,
        [identityId]: { error: 'Gagal menghubungi server.' },
      }));
    } finally {
      setClaimLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Warning box */}
      <div className="rounded-xl border border-yellow-500/25 bg-yellow-950/20 p-4 flex items-start gap-3 text-xs text-yellow-200/80">
        <ShieldAlert size={16} className="shrink-0 text-yellow-400 mt-0.5" />
        <div>
          <p className="font-bold text-yellow-300 mb-0.5">Penting — Token Hash vs Token Asli</p>
          <p>
            Kolom <strong>Private Token Hash</strong> adalah SHA-256 hash — <em>bukan</em> token yang bisa dipakai login.
            Token asli hanya ditampilkan satu kali saat identitas dibuat dan tidak pernah disimpan di server.
            Jika anggota tidak memiliki token aslinya, gunakan tombol <strong>&quot;Reset Token&quot;</strong> di bawah untuk menerbitkan token baru.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, Public Code, atau Farm ID..."
            className="w-full rounded-xl border border-emerald-900/70 bg-black/40 pl-9 pr-4 py-2.5 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-emerald-900/70 bg-black/40 px-3 py-2.5 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
        >
          <option value="all">Semua Tipe</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="self-center text-xs text-emerald-400/60 font-mono">
          {filtered.length} dari {memberRows.length} anggota
        </span>
      </div>

      {/* Member Cards */}
      <div className="space-y-3">
        {filtered.map((m) => {
          const color = TYPE_COLORS[m.identity_type] || 'emerald';
          const isExpanded = expandedId === m.identity_id;
          const showHash = visibleHashes.has(m.identity_id);
          const publicLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://podge-ecosystem.vercel.app'}/identity/view?id=${encodeURIComponent(m.public_code)}`;
          const resetResult = resetResults[m.identity_id];
          const claimResult = claimResults[m.identity_id];
          const isResetting = resetLoading === m.identity_id;
          const isClaimChanging = claimLoading === m.identity_id;
          const awaitingConfirm = confirmReset === m.identity_id;
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://podge-ecosystem.vercel.app';

          return (
            <div
              key={m.identity_id}
              className={`rounded-xl border bg-black/30 overflow-hidden transition-all ${isExpanded ? 'border-emerald-600/40' : 'border-emerald-900/50'}`}
            >
              {/* Row header */}
              <div
                className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-emerald-950/20 transition"
                onClick={() => setExpandedId(isExpanded ? null : m.identity_id)}
              >
                <div className={`h-9 w-9 shrink-0 rounded-lg bg-${color}-500/15 text-${color}-400 flex items-center justify-center`}>
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{m.display_name}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-${color}-500/15 text-${color}-300 border border-${color}-500/20 uppercase tracking-wider`}>
                      {TYPE_LABELS[m.identity_type] || m.identity_type}
                    </span>
                    {m.role_id && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/15 uppercase tracking-wider">
                        {m.role_id}
                      </span>
                    )}
                    {!m.is_active && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/15 uppercase">
                        Tidak Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-emerald-400/60 mt-0.5 truncate">{m.public_code}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${m.is_claimed ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'}`}>
                    {m.is_claimed ? 'Claimed' : 'Unclaimed'}
                  </span>
                  {isExpanded ? <ChevronUp size={15} className="text-emerald-400/60" /> : <ChevronDown size={15} className="text-emerald-400/60" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-emerald-900/50 p-4 space-y-4">

                  {/* ===== RESET TOKEN RESULT ===== */}
                  {resetResult?.error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200 flex items-start gap-2">
                      <ShieldAlert size={13} className="shrink-0 text-red-400 mt-0.5" />
                      {resetResult.error}
                    </div>
                  )}

                  {resetResult?.success && resetResult.newToken && (
                    <div className="rounded-xl border border-yellow-400/30 bg-yellow-950/20 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold font-mono uppercase tracking-wider">
                        <KeyRound size={13} />
                        Token Baru — Berikan Kepada Anggota (Hanya Tampil Sekali)
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[11px] font-mono text-yellow-100 bg-black/50 border border-yellow-900/40 rounded-lg p-2.5 break-all">
                          {resetResult.newToken}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyText(resetResult.newToken!, `new-tk-${m.identity_id}`)}
                          className="p-2 rounded-lg border border-yellow-900/40 bg-black/30 text-yellow-400 hover:text-yellow-200 transition shrink-0"
                        >
                          {copiedId === `new-tk-${m.identity_id}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      {/* Access QR with new token */}
                      <div className="flex gap-3 items-start pt-1">
                        <div className="bg-white p-1.5 rounded-lg shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qrUrl(accessLink(origin, m.public_code, resetResult.newToken))}
                            alt="QR Token Baru"
                            className="h-24 w-24"
                          />
                        </div>
                        <div className="text-[10px] text-yellow-200/70 space-y-1.5">
                          <p className="font-bold text-yellow-300 text-xs">QR Login Baru</p>
                          <p>Scan QR ini dari browser anggota untuk langsung login dengan token baru.</p>
                          <button
                            type="button"
                            onClick={() => copyText(accessLink(origin, m.public_code, resetResult.newToken!), `new-ql-${m.identity_id}`)}
                            className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-200 font-semibold transition"
                          >
                            {copiedId === `new-ql-${m.identity_id}` ? <Check size={11} /> : <Copy size={11} />}
                            Salin Link QR
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] text-yellow-400/60">
                        Token lama sudah tidak berlaku. Token baru ini tidak tersimpan di server — catat sekarang.
                      </p>
                    </div>
                  )}

                  {claimResult?.error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200 flex items-start gap-2">
                      <ShieldAlert size={13} className="shrink-0 text-red-400 mt-0.5" />
                      {claimResult.error}
                    </div>
                  )}

                  {claimResult?.success && claimResult.message && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 flex items-start gap-2">
                      <Check size={13} className="shrink-0 text-emerald-400 mt-0.5" />
                      {claimResult.message}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Left: identity data */}
                    <div className="space-y-2 text-xs">
                      <Detail label="Identity ID" value={m.identity_id} onCopy={() => copyText(m.identity_id, `id-${m.identity_id}`)} isCopied={copiedId === `id-${m.identity_id}`} />
                      <Detail label="Public Code" value={m.public_code} onCopy={() => copyText(m.public_code, `pc-${m.identity_id}`)} isCopied={copiedId === `pc-${m.identity_id}`} />
                      {m.linked_farm_id && (
                        <Detail label="Farm ID" value={m.linked_farm_id} onCopy={() => copyText(m.linked_farm_id!, `fi-${m.identity_id}`)} isCopied={copiedId === `fi-${m.identity_id}`} />
                      )}

                      {/* Token hash */}
                      <div className="rounded-lg border border-emerald-900/50 bg-black/25 p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/60 font-semibold flex items-center gap-1">
                            <KeyRound size={10} />
                            Private Token Hash (SHA-256)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleHash(m.identity_id)}
                              className="p-1 rounded text-emerald-400/60 hover:text-emerald-300 transition"
                              title={showHash ? 'Sembunyikan' : 'Tampilkan'}
                            >
                              {showHash ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyText(m.private_token_hash, `th-${m.identity_id}`)}
                              className="p-1 rounded text-emerald-400/60 hover:text-emerald-300 transition"
                            >
                              {copiedId === `th-${m.identity_id}` ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                        <code className={`block text-[10px] font-mono text-emerald-200 break-all leading-relaxed transition-all ${!showHash ? 'blur-sm select-none' : ''}`}>
                          {m.private_token_hash}
                        </code>
                        <p className="text-[9px] text-red-400/70 mt-1.5 font-semibold">
                          ⛔ Jangan berikan nilai ini ke anggota — ini hash, bukan token asli.
                        </p>
                      </div>

                      {m.recovery_code_hash && (
                        <div className="rounded-lg border border-yellow-900/40 bg-yellow-950/15 p-2.5">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-yellow-400/70 font-semibold block mb-1">Recovery Code Hash</span>
                          <code className="text-[10px] font-mono text-yellow-200/70 break-all leading-relaxed blur-sm select-none">
                            {m.recovery_code_hash}
                          </code>
                          <p className="text-[9px] text-yellow-400/40 mt-1">Hash — kode asli tidak dapat dipulihkan admin.</p>
                        </div>
                      )}

                      {/* Reset Token Button */}
                      <div className="grid gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isClaimChanging}
                          onClick={() => handleClaimStatus(m.identity_id, m.is_claimed ? 'unclaim' : 'claim')}
                          className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[10px] font-bold transition disabled:opacity-50 ${
                            m.is_claimed
                              ? 'border border-yellow-500/40 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/40'
                              : 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/60'
                          }`}
                        >
                          {isClaimChanging ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                          {isClaimChanging
                            ? 'Memproses Status...'
                            : m.is_claimed
                              ? 'Unclaim Anggota'
                              : 'Claim Anggota'}
                        </button>
                        {awaitingConfirm ? (
                          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 space-y-2">
                            <p className="text-[10px] text-red-300 font-semibold">
                              ⚠ Konfirmasi: Token lama <strong>{m.display_name}</strong> akan langsung tidak berlaku. Lanjutkan?
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleResetToken(m.identity_id)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 text-[10px] font-bold transition"
                              >
                                <RefreshCcw size={11} />
                                Ya, Reset Token
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmReset(null)}
                                className="flex-1 rounded-lg border border-emerald-900/50 bg-black/30 text-emerald-400 px-3 py-1.5 text-[10px] transition hover:bg-emerald-950/40"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isResetting}
                            onClick={() => handleResetToken(m.identity_id)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-orange-500/40 bg-orange-950/20 px-3 py-2 text-[10px] font-bold text-orange-300 hover:bg-orange-950/40 transition disabled:opacity-50"
                          >
                            {isResetting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                            {isResetting ? 'Mereset Token...' : 'Reset Token (Generate Baru)'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: metadata & QR */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {[
                          { label: 'Dibuat', value: new Date(m.created_at).toLocaleString('id-ID') },
                          { label: 'Diperbarui', value: new Date(m.updated_at).toLocaleString('id-ID') },
                          { label: 'Diklaim Pada', value: m.claimed_at ? new Date(m.claimed_at).toLocaleString('id-ID') : '—' },
                          { label: 'Token Dirotasi', value: m.token_rotated_at ? new Date(m.token_rotated_at).toLocaleString('id-ID') : 'Belum pernah' },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg border border-emerald-900/50 bg-black/25 p-2">
                            <span className="font-mono uppercase text-emerald-400/60 block">{label}</span>
                            <span className="text-emerald-100/80 mt-0.5 block">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Public QR */}
                      <div className="flex gap-3 items-start">
                        <div className="bg-white p-1.5 rounded-lg shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={qrUrl(publicLink)} alt="Public QR" className="h-20 w-20" />
                        </div>
                        <div className="text-[10px] space-y-1 text-emerald-200/60">
                          <p className="font-bold text-emerald-300 text-xs">QR Publik Identity</p>
                          <p>Untuk verifikasi publik. Aman dibagikan.</p>
                          <button
                            type="button"
                            onClick={() => copyText(publicLink, `ql-${m.identity_id}`)}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-200 font-semibold transition"
                          >
                            {copiedId === `ql-${m.identity_id}` ? <Check size={11} /> : <Copy size={11} />}
                            Salin Link
                          </button>
                        </div>
                      </div>

                      {/* Admin action links */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/identity/view?id=${encodeURIComponent(m.public_code)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-1.5 text-[10px] font-mono text-emerald-300 hover:bg-emerald-950/60 transition"
                        >
                          <QrCode size={11} />
                          Lihat Publik
                        </a>
                        {m.linked_farm_id && (
                          <a
                            href={`/governance/farmid?mode=view&id=${encodeURIComponent(m.linked_farm_id)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-800/50 bg-blue-950/20 px-3 py-1.5 text-[10px] font-mono text-blue-300 hover:bg-blue-950/40 transition"
                          >
                            <ShieldCheck size={11} />
                            Lihat FarmID
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-emerald-900/60 bg-black/20 p-10 text-center text-sm text-emerald-300/40">
            <AlertCircle size={28} className="mx-auto mb-3 opacity-40" />
            Tidak ada anggota yang cocok dengan filter.
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="rounded-lg border border-emerald-900/50 bg-black/25 p-2.5 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/60 font-semibold block">{label}</span>
        <code className="text-[11px] font-mono text-emerald-100 truncate block">{value}</code>
      </div>
      <button type="button" onClick={onCopy} className="shrink-0 p-1 rounded text-emerald-400/60 hover:text-emerald-300 transition">
        {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      </button>
    </div>
  );
}
