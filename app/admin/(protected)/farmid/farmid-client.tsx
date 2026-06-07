'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  Undo2,
  Search,
  Eye,
  Fingerprint,
  CheckCircle2,
  ShieldAlert,
  Sprout,
  Copy,
  QrCode,
  KeyRound,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';
import { verifyKyc, rejectKyc, resetKyc } from './actions';

type FarmerIdRow = {
  farm_id: string;
  identity_id: string | null;
  farmer_name: string;
  cooperative_name: string;
  village: string;
  district: string;
  province: string;
  area_hectare: string | number;
  commodity: string;
  harvest_status: string;
  public_status: string;
  public_live_at: string | null;
  verification_status: string;
  verified_at: string | null;
  verified_by: string | null;
  verification_note: string | null;
  public_note: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
  photo_base64: string | null;

  // Joined fields
  identity_uuid: string | null;
  identity_public_code: string | null;
  identity_display_name: string | null;
  identity_is_claimed: boolean | null;
  identity_claimed_at: string | null;
  identity_token_rotated_at: string | null;
  identity_private_token_hash: string | null;
  identity_recovery_code_hash: string | null;
  identity_is_active: boolean | null;
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

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(value)}`;
}

function accessLink(origin: string, publicCode: string, token: string) {
  return `${origin}/identity/access?id=${encodeURIComponent(publicCode)}&token=${encodeURIComponent(token)}`;
}

export default function FarmIdClient({ initialRecords }: { initialRecords: FarmerIdRow[] }) {
  const [records, setRecords] = useState<FarmerIdRow[]>(initialRecords);
  const [search, setSearch] = useState('');
  const [filterKyc, setFilterKyc] = useState('all');
  const [filterClaim, setFilterClaim] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notes state for KYC forms
  const [kycNotes, setKycNotes] = useState<Record<string, string>>({});

  // Loading and action states
  const [submittingKyc, setSubmittingKyc] = useState<string | null>(null);
  const [submittingClaim, setSubmittingClaim] = useState<string | null>(null);
  const [resettingToken, setResettingToken] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  
  // Results
  const [resetResults, setResetResults] = useState<Record<string, ResetResult>>({});
  const [claimResults, setClaimResults] = useState<Record<string, ClaimResult>>({});
  const [visibleHashes, setVisibleHashes] = useState<Set<string>>(new Set());

  // Filter records
  const filtered = records.filter((r) => {
    const matchSearch =
      !search ||
      r.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.farm_id.toLowerCase().includes(search.toLowerCase()) ||
      r.cooperative_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.identity_public_code || '').toLowerCase().includes(search.toLowerCase());

    const matchKyc = filterKyc === 'all' || r.verification_status === filterKyc;
    
    const isClaimedVal = r.identity_uuid ? r.identity_is_claimed : false;
    const matchClaim =
      filterClaim === 'all' ||
      (filterClaim === 'claimed' && isClaimedVal) ||
      (filterClaim === 'unclaimed' && !isClaimedVal);

    return matchSearch && matchKyc && matchClaim;
  });

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://podge-ecosystem.vercel.app';

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  function toggleHash(id: string) {
    setVisibleHashes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // KYC Handlers
  async function handleVerify(farmId: string) {
    const note = kycNotes[farmId] || 'Dokumen KTP dan sertifikat lahan terverifikasi sesuai.';
    setSubmittingKyc(farmId);
    try {
      const res = await verifyKyc(farmId, note);
      if (res.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.farm_id === farmId
              ? {
                  ...r,
                  verification_status: 'verified',
                  verification_note: note,
                  public_status: 'live',
                }
              : r
          )
        );
      } else {
        alert(`Gagal memverifikasi KYC: ${res.error}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingKyc(null);
    }
  }

  async function handleReject(farmId: string) {
    const note = kycNotes[farmId];
    if (!note) {
      alert('Catatan audit wajib diisi untuk penolakan.');
      return;
    }
    setSubmittingKyc(farmId);
    try {
      const res = await rejectKyc(farmId, note);
      if (res.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.farm_id === farmId
              ? {
                  ...r,
                  verification_status: 'rejected',
                  verification_note: note,
                }
              : r
          )
        );
      } else {
        alert(`Gagal menolak KYC: ${res.error}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingKyc(null);
    }
  }

  async function handleResetKyc(farmId: string) {
    const note = kycNotes[farmId] || 'Status di-reset untuk verifikasi ulang.';
    setSubmittingKyc(farmId);
    try {
      const res = await resetKyc(farmId, note);
      if (res.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.farm_id === farmId
              ? {
                  ...r,
                  verification_status: 'pending',
                  verification_note: note,
                }
              : r
          )
        );
      } else {
        alert(`Gagal me-reset KYC: ${res.error}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingKyc(null);
    }
  }

  // Claim Toggle Handler
  async function handleClaimStatus(farmId: string, identityId: string, action: 'claim' | 'unclaim') {
    setSubmittingClaim(farmId);
    setClaimResults((prev) => ({ ...prev, [identityId]: {} }));

    try {
      const resp = await fetch('/api/admin/members/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId, action }),
      });
      const data = await resp.json() as ClaimResult & { identity?: any };
      setClaimResults((prev) => ({ ...prev, [identityId]: data }));

      if (resp.ok && data.identity) {
        const nextClaimed = Boolean(data.identity.is_claimed);
        const nextClaimedAt = data.identity.claimed_at || null;

        setRecords((prev) =>
          prev.map((r) =>
            r.farm_id === farmId
              ? {
                  ...r,
                  is_claimed: nextClaimed,
                  claimed_at: nextClaimedAt,
                  identity_is_claimed: nextClaimed,
                  identity_claimed_at: nextClaimedAt,
                }
              : r
          )
        );
      } else {
        alert(data.error || 'Gagal mengubah status klaim.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setSubmittingClaim(null);
    }
  }

  // Reset Token Handler
  async function handleResetToken(farmId: string, identityId: string) {
    if (confirmReset !== identityId) {
      setConfirmReset(identityId);
      return;
    }
    setConfirmReset(null);
    setResettingToken(farmId);
    setResetResults((prev) => ({ ...prev, [identityId]: {} }));

    try {
      const resp = await fetch('/api/admin/reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId }),
      });
      const data = await resp.json() as ResetResult;
      setResetResults((prev) => ({ ...prev, [identityId]: data }));

      if (resp.ok && data.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.farm_id === farmId
              ? {
                  ...r,
                  identity_token_rotated_at: new Date().toISOString(),
                }
              : r
          )
        );
      }
    } catch {
      setResetResults((prev) => ({
        ...prev,
        [identityId]: { error: 'Gagal menghubungi server.' },
      }));
    } finally {
      setResettingToken(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama petani, FarmID, Koperasi, atau PODGE-ID..."
            className="w-full rounded-xl border border-emerald-900/70 bg-black/40 pl-9 pr-4 py-2.5 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
          />
        </div>
        <select
          value={filterKyc}
          onChange={(e) => setFilterKyc(e.target.value)}
          className="rounded-xl border border-emerald-900/70 bg-black/40 px-3 py-2.5 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
        >
          <option value="all">Semua Status KYC</option>
          <option value="pending">Pending</option>
          <option value="verified">Terverifikasi</option>
          <option value="rejected">Ditolak</option>
        </select>
        <select
          value={filterClaim}
          onChange={(e) => setFilterClaim(e.target.value)}
          className="rounded-xl border border-emerald-900/70 bg-black/40 px-3 py-2.5 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
        >
          <option value="all">Semua Status Klaim</option>
          <option value="claimed">Sudah Diklaim</option>
          <option value="unclaimed">Belum Diklaim</option>
        </select>
        <span className="self-center text-xs text-emerald-400/60 font-mono">
          {filtered.length} dari {records.length} data
        </span>
      </div>

      {/* Main Table */}
      <section className="rounded-xl border border-emerald-900/60 bg-black/25 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-900/60 text-[10px] uppercase tracking-widest text-emerald-400 font-mono">
                <th className="px-5 py-4 font-semibold">Petani / FarmID</th>
                <th className="px-5 py-4 font-semibold">Koperasi</th>
                <th className="px-5 py-4 font-semibold">Alamat & Luas</th>
                <th className="px-5 py-4 font-semibold">Status Publik</th>
                <th className="px-5 py-4 font-semibold">Status KYC</th>
                <th className="px-5 py-4 font-semibold">PODGE-ID & Klaim</th>
                <th className="px-5 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80">
              {filtered.map((record) => {
                const isExpanded = expandedId === record.farm_id;
                const hasIdentity = Boolean(record.identity_uuid);
                const isClaimedVal = hasIdentity ? record.identity_is_claimed : false;

                const publicLink = `${origin}/identity/view?id=${encodeURIComponent(record.identity_public_code || '')}`;

                const resetResult = resetResults[record.identity_uuid || ''];
                const claimResult = claimResults[record.identity_uuid || ''];
                
                const isSubmittingKyc = submittingKyc === record.farm_id;
                const isSubmittingClaim = submittingClaim === record.farm_id;
                const isResettingToken = resettingToken === record.farm_id;
                const isAwaitingConfirm = confirmReset === record.identity_uuid;

                const showHash = visibleHashes.has(record.farm_id);

                return (
                  <>
                    <tr
                      key={record.farm_id}
                      onClick={() => setExpandedId(isExpanded ? null : record.farm_id)}
                      className={`text-emerald-50/85 hover:bg-emerald-950/10 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-emerald-950/15' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-white text-sm">{record.farmer_name}</p>
                        <p className="font-mono text-[10px] text-emerald-400 mt-0.5">{record.farm_id}</p>
                      </td>
                      <td className="px-5 py-4 text-emerald-100/70">{record.cooperative_name}</td>
                      <td className="px-5 py-4 text-emerald-100/70">
                        <p className="truncate max-w-[150px]">{record.village}, {record.district}</p>
                        <p className="text-xs text-emerald-400 font-bold mt-0.5">{record.area_hectare} Ha</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            record.public_status === 'live'
                              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                              : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
                          }`}
                        >
                          {record.public_status === 'live' ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            record.verification_status === 'verified'
                              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                              : record.verification_status === 'rejected'
                              ? 'border-red-400/40 bg-red-500/15 text-red-300'
                              : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
                          }`}
                        >
                          {record.verification_status === 'verified'
                            ? 'Terverifikasi'
                            : record.verification_status === 'rejected'
                            ? 'Ditolak'
                            : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {hasIdentity ? (
                          <div className="space-y-0.5">
                            <code className="text-xs text-emerald-300 block">{record.identity_public_code}</code>
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                isClaimedVal
                                  ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-400'
                                  : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                              }`}
                            >
                              {isClaimedVal ? 'Claimed' : 'Unclaimed'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-yellow-500/60 font-mono">Belum Terhubung</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/governance/farmid?mode=view&id=${encodeURIComponent(record.farm_id)}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-800/60 px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/40 transition"
                          >
                            <Eye size={12} />
                          </Link>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : record.farm_id)}
                            className="p-1.5 rounded-lg border border-emerald-900 bg-black/20 text-emerald-400 hover:bg-emerald-950/30 transition"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Collapsible details panel */}
                    {isExpanded && (
                      <tr className="bg-emerald-950/5">
                        <td colSpan={7} className="px-6 py-6 border-t border-b border-emerald-900/30">
                          <div className="grid lg:grid-cols-2 gap-8">
                            
                            {/* Left Column: Farm Details & KYC actions */}
                            <div className="space-y-5">
                              <div>
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                  <Layers size={14} className="text-emerald-400" />
                                  Informasi Berkas Lahan & KYC
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-xs bg-black/20 border border-emerald-900/30 p-4 rounded-xl">
                                  <div>
                                    <span className="text-emerald-400/60 block font-mono uppercase text-[9px]">Provinsi</span>
                                    <span className="text-white font-medium">{record.province}</span>
                                  </div>
                                  <div>
                                    <span className="text-emerald-400/60 block font-mono uppercase text-[9px]">Kabupaten / Kecamatan</span>
                                    <span className="text-white font-medium">{record.district}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-emerald-400/60 block font-mono uppercase text-[9px]">Desa / Alamat</span>
                                    <span className="text-white font-medium">{record.village}</span>
                                  </div>
                                  <div>
                                    <span className="text-emerald-400/60 block font-mono uppercase text-[9px]">Komoditas</span>
                                    <span className="text-white font-medium">{record.commodity}</span>
                                  </div>
                                  <div>
                                    <span className="text-emerald-400/60 block font-mono uppercase text-[9px]">Status Panen</span>
                                    <span className="text-white font-medium">{record.harvest_status}</span>
                                  </div>
                                </div>
                              </div>

                              {/* KYC Governance Panel */}
                              <div className="border-t border-emerald-900/30 pt-4">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                  <ShieldCheck size={14} className="text-emerald-400" />
                                  Tindakan KYC Verifikasi Lahan
                                </h4>
                                
                                {record.verification_status === 'pending' ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-[10px] uppercase font-mono tracking-wider text-emerald-400/60 mb-1">Catatan Evaluasi / Audit</label>
                                      <input
                                        type="text"
                                        value={kycNotes[record.farm_id] || ''}
                                        onChange={(e) => setKycNotes(prev => ({ ...prev, [record.farm_id]: e.target.value }))}
                                        placeholder="Misal: Sertifikat cocok dengan data BPN..."
                                        className="w-full bg-black/40 border border-emerald-950 text-xs px-3 py-2 rounded-lg outline-none text-emerald-50 placeholder-emerald-900 focus:border-emerald-600"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleVerify(record.farm_id)}
                                        disabled={isSubmittingKyc}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 text-xs font-bold transition disabled:opacity-50"
                                      >
                                        {isSubmittingKyc ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                                        Setujui & Terbitkan
                                      </button>
                                      <button
                                        onClick={() => handleReject(record.farm_id)}
                                        disabled={isSubmittingKyc}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-3 py-2 text-xs font-bold transition disabled:opacity-50"
                                      >
                                        {isSubmittingKyc ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
                                        Tolak KYC
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3 bg-black/25 border border-emerald-950 p-3 rounded-lg text-xs">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[10px] uppercase font-mono text-emerald-400/60 block">Catatan Terakhir:</span>
                                        <p className="text-emerald-100 italic mt-0.5">
                                          &ldquo;{record.verification_note || '-'}&rdquo;
                                        </p>
                                      </div>
                                      <span className="text-[10px] font-mono text-emerald-400/40">
                                        {record.verified_at ? new Date(record.verified_at).toLocaleDateString('id-ID') : ''}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleResetKyc(record.farm_id)}
                                      disabled={isSubmittingKyc}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-700/60 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/50 px-3 py-1.5 text-[10px] font-bold transition disabled:opacity-50"
                                    >
                                      {isSubmittingKyc ? <Loader2 size={10} className="animate-spin" /> : <Undo2 size={10} />}
                                      Reset Status Verifikasi ke Pending
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Column: Identity details & action forms */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                <KeyRound size={14} className="text-emerald-400" />
                                Kredensial & Status Klaim Kartu
                              </h4>

                              {hasIdentity ? (
                                <div className="space-y-4 text-xs">
                                  
                                  {/* Reset Token feedback boxes */}
                                  {resetResult?.error && (
                                    <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200 flex items-start gap-2">
                                      <ShieldAlert size={13} className="shrink-0 text-red-400 mt-0.5" />
                                      {resetResult.error}
                                    </div>
                                  )}

                                  {resetResult?.success && resetResult.newToken && (
                                    <div className="rounded-xl border border-yellow-400/35 bg-yellow-950/30 p-4 space-y-3">
                                      <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold font-mono uppercase tracking-wider">
                                        <KeyRound size={13} />
                                        Token Baru — Berikan Kepada Petani (Hanya Tampil Sekali)
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <code className="flex-1 text-[11px] font-mono text-yellow-100 bg-black/60 border border-yellow-900/50 rounded-lg p-2.5 break-all">
                                          {resetResult.newToken}
                                        </code>
                                        <button
                                          type="button"
                                          onClick={() => copyText(resetResult.newToken!, `new-tk-${record.farm_id}`)}
                                          className="p-2 rounded-lg border border-yellow-900/50 bg-black/30 text-yellow-400 hover:text-yellow-200 transition shrink-0"
                                        >
                                          {copiedId === `new-tk-${record.farm_id}` ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                      </div>

                                      {/* Access QR with new token */}
                                      <div className="flex gap-3 items-start pt-1">
                                        <div className="bg-white p-1.5 rounded-lg shrink-0">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={qrUrl(accessLink(origin, record.identity_public_code!, resetResult.newToken))}
                                            alt="QR Token Baru"
                                            className="h-24 w-24"
                                          />
                                        </div>
                                        <div className="text-[10px] text-yellow-200/70 space-y-1.5">
                                          <p className="font-bold text-yellow-300 text-xs">QR Login Baru</p>
                                          <p>Scan QR ini dari browser petani untuk login instan dengan token baru.</p>
                                          <button
                                            type="button"
                                            onClick={() => copyText(accessLink(origin, record.identity_public_code!, resetResult.newToken!), `new-ql-${record.farm_id}`)}
                                            className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-200 font-semibold transition"
                                          >
                                            {copiedId === `new-ql-${record.farm_id}` ? <Check size={11} /> : <Copy size={11} />}
                                            Salin Link QR
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-[9px] text-yellow-400/60 leading-normal">
                                        Token lama sudah tidak berlaku. Token baru ini tidak disimpan di server — salin dan simpan sekarang.
                                      </p>
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <div className="rounded-lg border border-emerald-900/50 bg-black/25 p-2.5 flex items-center justify-between">
                                      <div>
                                        <span className="text-[9px] font-mono uppercase text-emerald-400/60 block">PODGE-ID Public Code</span>
                                        <code className="text-white text-xs font-semibold">{record.identity_public_code}</code>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyText(record.identity_public_code!, `pc-${record.farm_id}`)}
                                        className="p-1 rounded text-emerald-400/60 hover:text-emerald-300 transition"
                                      >
                                        {copiedId === `pc-${record.farm_id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                      </button>
                                    </div>

                                    {/* Private token hash display */}
                                    <div className="rounded-lg border border-emerald-900/50 bg-black/25 p-2.5">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-mono uppercase text-emerald-400/60 block">Private Token Hash (SHA-256)</span>
                                        <div className="flex gap-1.5">
                                          <button
                                            onClick={() => toggleHash(record.farm_id)}
                                            className="p-1 text-emerald-400/50 hover:text-emerald-300 rounded"
                                          >
                                            {showHash ? <Eye size={12} /> : <Eye size={12} className="opacity-40" />}
                                          </button>
                                          <button
                                            onClick={() => copyText(record.identity_private_token_hash || '', `hash-${record.farm_id}`)}
                                            className="p-1 text-emerald-400/50 hover:text-emerald-300 rounded"
                                          >
                                            {copiedId === `hash-${record.farm_id}` ? <Check size={12} /> : <Copy size={12} />}
                                          </button>
                                        </div>
                                      </div>
                                      <code className={`block text-[10px] font-mono text-emerald-200/70 break-all leading-normal ${!showHash ? 'blur-sm select-none' : ''}`}>
                                        {record.identity_private_token_hash}
                                      </code>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-emerald-100/65 font-mono pt-1">
                                      <div className="bg-black/20 border border-emerald-900/40 rounded-lg p-2">
                                        <span className="text-emerald-400/55 block">DIKLAIM PADA</span>
                                        {record.identity_claimed_at ? new Date(record.identity_claimed_at).toLocaleDateString('id-ID') : 'Belum klaim'}
                                      </div>
                                      <div className="bg-black/20 border border-emerald-900/40 rounded-lg p-2">
                                        <span className="text-emerald-400/55 block">ROTASI TOKEN</span>
                                        {record.identity_token_rotated_at ? new Date(record.identity_token_rotated_at).toLocaleDateString('id-ID') : 'Belum pernah'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Administrative Operations for identity */}
                                  <div className="grid gap-2 pt-2 border-t border-emerald-900/30">
                                    <button
                                      type="button"
                                      disabled={isSubmittingClaim}
                                      onClick={() => handleClaimStatus(record.farm_id, record.identity_uuid!, isClaimedVal ? 'unclaim' : 'claim')}
                                      className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[10px] font-bold transition disabled:opacity-50 ${
                                        isClaimedVal
                                          ? 'border border-yellow-500/40 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/40'
                                          : 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/60'
                                      }`}
                                    >
                                      {isSubmittingClaim ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                                      {isSubmittingClaim
                                        ? 'Memproses...'
                                        : isClaimedVal
                                          ? 'Batalkan Klaim (Unclaim)'
                                          : 'Verifikasi Klaim Kartu (Claim)'}
                                    </button>

                                    {isAwaitingConfirm ? (
                                      <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 space-y-2 text-xs">
                                        <p className="text-[10px] text-red-300 font-semibold leading-normal">
                                          ⚠ Konfirmasi: Token lama petani <strong>{record.farmer_name}</strong> akan langsung hangus. Lanjutkan reset?
                                        </p>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleResetToken(record.farm_id, record.identity_uuid!)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 text-[10px] font-bold transition"
                                          >
                                            <RefreshCcw size={11} />
                                            Ya, Reset
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
                                        disabled={isResettingToken}
                                        onClick={() => handleResetToken(record.farm_id, record.identity_uuid!)}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-orange-500/40 bg-orange-950/20 px-3 py-2 text-[10px] font-bold text-orange-300 hover:bg-orange-950/40 transition disabled:opacity-50"
                                      >
                                        {isResettingToken ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                                        Reset & Generate Token Baru
                                      </button>
                                    )}
                                  </div>

                                  {/* Public QR for scanning */}
                                  <div className="flex gap-3 items-start bg-black/20 p-3 rounded-lg border border-emerald-900/30 mt-2">
                                    <div className="bg-white p-1 rounded shrink-0">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={qrUrl(publicLink)} alt="Public QR" className="h-16 w-16" />
                                    </div>
                                    <div className="text-[10px] text-emerald-200/50 space-y-1">
                                      <p className="font-bold text-emerald-300">QR Publik Identitas</p>
                                      <p className="leading-relaxed">Scan untuk validasi kepemilikan kartu secara publik.</p>
                                      <button
                                        type="button"
                                        onClick={() => copyText(publicLink, `ql-${record.farm_id}`)}
                                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-200 transition font-semibold"
                                      >
                                        Salin Link Publik
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-yellow-900/40 bg-yellow-950/5 p-5 text-center text-xs text-yellow-300/60 leading-normal">
                                  <ShieldAlert size={20} className="mx-auto mb-2 text-yellow-500" />
                                  <p className="font-bold text-yellow-300 mb-1">PODGE-ID Belum Dibuat</p>
                                  <p className="mb-3">Petani ini belum memiliki identitas terhubung di sistem.</p>
                                  <Link
                                    href={`/admin/identity?linkedFarmId=${encodeURIComponent(record.farm_id)}`}
                                    className="inline-flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black px-3.5 py-1.5 text-[10px] font-bold transition"
                                  >
                                    Generate PODGE-ID Sekarang
                                  </Link>
                                </div>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-emerald-200/50">
                    <ShieldAlert size={24} className="mx-auto mb-2 opacity-50" />
                    Tidak ada berkas lahan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
