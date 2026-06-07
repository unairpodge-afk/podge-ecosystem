'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Check,
  Copy,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  QrCode,
  RefreshCcw,
  ShieldAlert,
  Sprout,
  Camera,
  Printer,
  Trash2,
  ArrowRight,
  User,
  Info as InfoIcon,
  AlertCircle,
  FileText,
  Building
} from 'lucide-react';
import type { PublicPodgeIdentityRecord } from '@/lib/identity';

type FarmerRecord = {
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
  verification_note: string | null;
  public_note: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  updated_at: string;
  photo_base64?: string | null;
};

type AccessState = {
  tokenValid: boolean;
  canClaim: boolean;
  canEdit: boolean;
  claimedOnThisDevice: boolean;
};

type ApiResult = {
  record?: FarmerRecord;
  privateToken?: string;
  identity?: PublicPodgeIdentityRecord;
  identityPrivateToken?: string;
  identityRecoveryCode?: string;
  access?: AccessState;
  canEdit?: boolean;
  message?: string;
  error?: string;
};

type FarmIdClientProps = {
  initialLinkedFarmId?: string | null;
  isRegistered?: boolean;
  identityType?: string | null;
};

const emptyAccess: AccessState = {
  tokenValid: false,
  canClaim: false,
  canEdit: false,
  claimedOnThisDevice: false,
};

function getDeviceKey() {
  const storageKey = 'podge:farmid:device-key';
  const existing = localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const nextKey = crypto.randomUUID();
  localStorage.setItem(storageKey, nextKey);
  return nextKey;
}

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(value)}`;
}

export default function FarmIdClient({
  initialLinkedFarmId = null,
  isRegistered = false,
  identityType = null,
}: FarmIdClientProps) {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || initialLinkedFarmId || '';
  const queryToken = searchParams.get('token') || '';
  const queryMode = searchParams.get('mode') || '';
  
  const [deviceKey, setDeviceKey] = useState('');
  const [record, setRecord] = useState<FarmerRecord | null>(null);
  const [privateToken, setPrivateToken] = useState(queryToken);
  const [access, setAccess] = useState<AccessState>(emptyAccess);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [harvestStatus, setHarvestStatus] = useState('Belum ada update panen');
  const [publicNote, setPublicNote] = useState('');
  const [identity, setIdentity] = useState<PublicPodgeIdentityRecord | null>(null);
  const [identityPrivateToken, setIdentityPrivateToken] = useState('');
  const [identityRecoveryCode, setIdentityRecoveryCode] = useState('');

  // Live preview form states
  const [formFarmerName, setFormFarmerName] = useState('');
  const [formCooperativeName, setFormCooperativeName] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [formAreaHectare, setFormAreaHectare] = useState('');

  // Photo upload state
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const isClaimMode = queryMode === 'claim' && privateToken;
  const isViewMode = queryMode === 'view';
  const hasLinkedFarmId = Boolean(initialLinkedFarmId);
  const isFarmerIdentity = identityType === 'farmer';

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDeviceKey(getDeviceKey());
      setOrigin(window.location.origin);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const publicLink = useMemo(() => {
    if (!origin || !record) {
      return '';
    }
    return `${origin}/governance/farmid?mode=view&id=${encodeURIComponent(record.farm_id)}`;
  }, [origin, record]);

  // Load photo from database (or local storage fallback) based on active farm record
  useEffect(() => {
    if (record) {
      if (record.photo_base64) {
        setPhotoUrl(record.photo_base64);
      } else {
        const savedPhoto = localStorage.getItem(`podge:farmid:photo:${record.farm_id}`);
        if (savedPhoto) {
          setPhotoUrl(savedPhoto);
        } else {
          setPhotoUrl('');
        }
      }
    }
  }, [record]);

  const readFarmId = useCallback(async (id: string, token = privateToken, activeDeviceKey = deviceKey) => {
    if (!id || !activeDeviceKey) {
      return;
    }

    setLoading(true);
    setError('');

    const response = await fetch(
      `/api/farmid?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&deviceKey=${encodeURIComponent(activeDeviceKey)}`,
    );
    const data = await response.json() as ApiResult;
    setLoading(false);

    if (!response.ok || !data.record) {
      setError(data.error || 'FarmID tidak bisa dibaca.');
      return;
    }

    setRecord(data.record);
    setAccess(data.access || emptyAccess);
    setHarvestStatus(data.record.harvest_status);
    setPublicNote(data.record.public_note || '');
    if (data.identity) {
      setIdentity(data.identity);
    }
  }, [deviceKey, privateToken]);

  useEffect(() => {
    if (queryId && deviceKey) {
      const frame = requestAnimationFrame(() => {
        void readFarmId(queryId, queryToken, deviceKey);
      });

      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [deviceKey, queryId, queryToken, readFarmId]);

  async function generateFarmId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isRegistered) {
      setError('Silakan daftar dan masuk terlebih dahulu sebelum membuat FarmID.');
      return;
    }

    if (!isFarmerIdentity) {
      setError('FarmID hanya dapat dibuat oleh akun Petani. Silakan daftar/masuk sebagai Petani Mandiri.');
      return;
    }

    if (hasLinkedFarmId) {
      setError('Akun ini sudah memiliki FarmID. Gunakan menu Lihat Kartu Anggota.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch('/api/farmid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({ error: 'Server tidak mengembalikan JSON valid.' })) as ApiResult;

      if (!response.ok || !data.record || !data.privateToken) {
        setError(data.error || 'Gagal membuat FarmID.');
        return;
      }

      setRecord(data.record);
      setIdentity(data.identity || null);
      setIdentityPrivateToken(data.identityPrivateToken || '');
      setIdentityRecoveryCode(data.identityRecoveryCode || '');
      setPrivateToken(data.privateToken);
      setAccess(emptyAccess);
      setHarvestStatus(data.record.harvest_status);
      setPublicNote(data.record.public_note || '');
      
      if (photoUrl) {
        localStorage.setItem(`podge:farmid:photo:${data.record.farm_id}`, photoUrl);
      }

      setStatus('Kartu Identitas Digital Petani (FarmID) berhasil dibuat.');
    } catch (generateError) {
      const message = generateError instanceof Error ? generateError.message : String(generateError);
      setError(`Gagal membuat FarmID: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function claimFarmId() {
    if (!record || !privateToken || !deviceKey) {
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    const response = await fetch('/api/farmid/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: record.farm_id, token: privateToken, deviceKey }),
    });
    const data = await response.json() as ApiResult;
    setLoading(false);

    if (!response.ok || !data.record) {
      setError(data.error || 'FarmID gagal diklaim.');
      if (data.record) {
        setRecord(data.record);
      }
      return;
    }

    setRecord(data.record);
    setAccess({
      tokenValid: true,
      canClaim: false,
      canEdit: Boolean(data.canEdit),
      claimedOnThisDevice: Boolean(data.canEdit),
    });
    setStatus(data.message || 'FarmID berhasil diklaim.');
  }

  async function updateFarmId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!record || !privateToken || !deviceKey) {
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    const response = await fetch('/api/farmid/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: record.farm_id,
        token: privateToken,
        deviceKey,
        harvestStatus,
        publicNote,
      }),
    });
    const data = await response.json() as ApiResult;
    setLoading(false);

    if (!response.ok || !data.record) {
      setError(data.error || 'Update FarmID ditolak.');
      return;
    }

    setRecord(data.record);
    setStatus(data.message || 'Data publik berhasil diperbarui.');
  }

  const savePhotoToServer = useCallback(async (base64: string | null) => {
    if (!record || !privateToken) {
      return;
    }
    try {
      const response = await fetch('/api/farmid/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: record.farm_id,
          token: privateToken,
          photo_base64: base64,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal menyimpan foto ke server.');
      } else {
        setRecord((prev) => prev ? { ...prev, photo_base64: base64 } : null);
      }
    } catch (err) {
      console.error('Error saving photo to server:', err);
    }
  }, [record, privateToken]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoUrl(base64);
        if (record) {
          localStorage.setItem(`podge:farmid:photo:${record.farm_id}`, base64);
          void savePhotoToServer(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setStatus('Link verifikasi berhasil disalin.');
  }

  // HTML5 Canvas Exporter to Download as JPG
  const downloadCardAsJpg = () => {
    if (!record) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Gradient (emerald/black)
    const grad = ctx.createLinearGradient(0, 0, 1000, 600);
    if (record.verification_status === 'verified') {
      grad.addColorStop(0, '#0c301c');
      grad.addColorStop(0.5, '#020905');
      grad.addColorStop(1, '#12542e');
    } else {
      grad.addColorStop(0, '#06150d');
      grad.addColorStop(0.5, '#020704');
      grad.addColorStop(1, '#0c2415');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 600);

    // Decorative borders
    ctx.strokeStyle = record.verification_status === 'verified' ? '#10b981' : 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = record.verification_status === 'verified' ? 6 : 4;
    ctx.strokeRect(10, 10, 980, 580);
    
    // Top colored bar
    const barGrad = ctx.createLinearGradient(0, 0, 1000, 0);
    barGrad.addColorStop(0, '#10b981');
    barGrad.addColorStop(0.5, '#34d399');
    barGrad.addColorStop(1, '#059669');
    ctx.fillStyle = barGrad;
    ctx.fillRect(10, 10, 980, 12);

    // Draw header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('PODGE SAWIT INDONESIA', 50, 65);
    
    ctx.fillStyle = '#10b981';
    ctx.font = '14px monospace';
    ctx.fillText('Digital Farmer Identity Card (KTP-Petani)', 50, 90);

    // Badge Petani Mandiri or KYC VALID
    if (record.verification_status === 'verified') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fillRect(730, 45, 210, 40);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(730, 45, 210, 40);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KYC VALID', 835, 70);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(730, 45, 210, 40);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(730, 45, 210, 40);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PETANI MANDIRI', 835, 70);
      ctx.textAlign = 'left';
    }

    // 2. Photo Spot
    if (photoUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 50, 140, 220, 250);
        drawTextAndQR();
      };
      img.src = photoUrl;
    } else {
      // Placeholder photo box
      ctx.fillStyle = '#030d07';
      ctx.fillRect(50, 140, 220, 250);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.strokeRect(50, 140, 220, 250);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.font = '14px sans-serif';
      ctx.fillText('TANPA FOTO', 110, 260);
      drawTextAndQR();
    }

    function drawTextAndQR() {
      if (!ctx) return;
      // 3. Info labels and text
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('NAMA LENGKAP PETANI', 310, 160);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      const nameText = (record?.farmer_name || '').toUpperCase();
      ctx.fillText(nameText, 310, 195);
      if (record?.verification_status === 'verified') {
        const nameWidth = ctx.measureText(nameText).width;
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(' ✓', 315 + nameWidth, 195);
      }

      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('KOPERASI MITRA', 310, 245);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText((record?.cooperative_name || '').toUpperCase(), 310, 275);

      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('LUAS LAHAN KEBUN', 650, 245);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${record?.area_hectare} Hektar`, 650, 275);

      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('ALAMAT LAHAN KEBUN', 310, 325);
      ctx.fillStyle = '#e4ece7';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Desa ${record?.village}, Kec. ${record?.district}, ${record?.province}`, 310, 355);

      // 4. Footer Line
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.moveTo(50, 420);
      ctx.lineTo(950, 420);
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('KODE PODGE-ID / FARM-ID', 50, 450);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(record?.farm_id || '', 50, 485);

      // Affiliations
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.font = '12px sans-serif';
      ctx.fillText('Dicetak oleh: PODGE & Badan Pengelola Dana Perkebunan (BPDP)', 50, 535);

      // QR Code drawing
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        try {
          ctx.drawImage(qrImg, 780, 440, 130, 130);
        } catch (e) {
          // Fallback if CORS block drawing
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(780, 440, 130, 130);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('[QR CODE]', 815, 510);
        }
        triggerDownload();
      };
      qrImg.onerror = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(780, 440, 130, 130);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('[QR CODE]', 815, 510);
        triggerDownload();
      };
      qrImg.src = qrUrl(publicLink);

      function triggerDownload() {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.download = `KARTU_PETANI_${record?.farm_id}.jpg`;
        link.href = dataUrl;
        link.click();
      }
    }
  };

  // Derive Display values for card (handles both live preview and loaded records)
  const cardFarmerName = record ? record.farmer_name : (formFarmerName || 'NAMA PETANI');
  const cardCooperativeName = record ? record.cooperative_name : (formCooperativeName || 'NAMA KOPERASI MITRA');
  const cardAreaHectare = record ? record.area_hectare : (formAreaHectare || '0.00');
  const cardVillage = record ? record.village : (formVillage || 'Nama Desa');
  const cardDistrict = record ? record.district : (formDistrict || 'Kecamatan');
  const cardProvince = record ? record.province : (formProvince || 'Provinsi');
  const cardFarmId = record ? record.farm_id : `PODGE-FARM-${new Date().getFullYear()}-XXXXXXXX`;
  const showRegistrationForm = isRegistered && isFarmerIdentity && !hasLinkedFarmId && !record;
  const showRegisterPrompt = !isRegistered && !record && !isViewMode;
  const showRolePrompt = isRegistered && !isFarmerIdentity && !record && !isViewMode;
  const showClaimPanel = Boolean(record && (isClaimMode || access.canEdit || access.canClaim));

  // --- RENDERING DEDICATED VIEW MODE (TAB BARU - HANYA KARTU DIGITAL FINAL) ---
  if (isViewMode) {
    return (
      <div className="min-h-screen bg-[#040806] text-emerald-50 py-12 px-4 flex flex-col items-center justify-center space-y-6">
        
        {/* Style injection to center and isolate card during physical printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #000 !important;
              color: #fff !important;
            }
            .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            #printable-farmer-card-section {
              position: absolute !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              width: 100% !important;
              max-width: 500px !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
        `}} />

        <div className="text-center no-print">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            <Building size={14} />
            Verifikasi Identitas Petani (BPDP & PODGE)
          </div>
          <h1 className="mt-3 font-space text-2xl font-extrabold text-white">Kartu Identitas Petani Digital</h1>
          <p className="text-xs text-emerald-300/60 mt-1">Halaman verifikasi kredensial legalitas kebun sawit mandiri.</p>
        </div>

        {/* KYC Verification status alert box (Auditor/BPDP status) */}
        {record && (
          <div className="w-full max-w-[500px] no-print">
            {record.verification_status === 'verified' ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/40 p-4 text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-400">VERIFIKASI KYC LOLOS / VALID</p>
                  <p className="mt-0.5 text-emerald-300/70">
                    Kartu identitas ini telah sah diverifikasi oleh verifikator BPDPKS & PODGE. Luas kebun, koperasi mitra, dan koordinat wilayah dinyatakan valid.
                  </p>
                  {record.verification_note && (
                    <p className="mt-2 font-mono text-[10px] text-emerald-400/80 bg-black/30 p-2 rounded">
                      Catatan Audit: {record.verification_note}
                    </p>
                  )}
                </div>
              </div>
            ) : record.verification_status === 'rejected' ? (
              <div className="rounded-xl border border-red-500/25 bg-red-950/20 p-4 text-xs text-red-200 flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-400">VERIFIKASI KYC DITOLAK</p>
                  <p className="mt-0.5 text-red-300/70">
                    Ditemukan ketidakcocokan data. Hubungi admin koperasi verifikator untuk memperbaiki info lahan.
                  </p>
                  {record.verification_note && (
                    <p className="mt-2 font-mono text-[10px] text-red-400/80 bg-black/30 p-2 rounded">
                      Alasan Penolakan: {record.verification_note}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-xs text-yellow-200 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold text-yellow-400">PROSES KYC (MENUNGGU VERIFIKASI)</p>
                  <p className="mt-0.5 text-yellow-300/70">
                    Kartu digital telah diterbitkan oleh petani namun masih menunggu verifikasi dokumen fisik oleh Auditor BPDPKS & PODGE.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div id="printable-farmer-card-section" className="w-full">
          {record ? (
            <div className={`w-full max-w-[500px] mx-auto rounded-3xl p-6 sm:p-7 relative overflow-hidden font-space transition-all duration-500 ${
              record.verification_status === 'verified'
                ? 'bg-gradient-to-br from-[#0c301c] via-[#020905] to-[#12542e] border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-br from-[#06150d] via-[#020704] to-[#0c2415] border-2 border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
            }`}>
              {/* Holographic watermark seal checkmark if verified */}
              {record.verification_status === 'verified' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none animate-pulse" />
                  <div className="absolute -bottom-10 -left-10 text-emerald-500/5 pointer-events-none">
                    <CheckCircle2 size={220} className="stroke-[1]" />
                  </div>
                </>
              )}
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600"></div>
              <div className="absolute bottom-3 right-4 text-[9px] font-mono text-emerald-500/25 tracking-widest font-semibold">
                {record.verification_status === 'verified' ? 'VALIDATED KYC CARD' : 'SECURE DIGITAL CARD'}
              </div>

              {/* Card Header */}
              <div className="flex justify-between items-start pb-4 border-b border-emerald-950/80">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black text-base shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white tracking-wider uppercase leading-none">PODGE SAWIT</h4>
                    <span className="text-[8px] font-mono text-emerald-400 tracking-widest uppercase">Ecosystem Identity</span>
                  </div>
                </div>
                <div className="text-right">
                  {record.verification_status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-black bg-gradient-to-r from-emerald-400 to-teal-400 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.45)] uppercase tracking-wider">
                      <CheckCircle2 size={10} className="stroke-[3]" />
                      KYC VALID
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-0.5 rounded-md uppercase">
                      PETANI MANDIRI
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-[115px_1fr] gap-5 items-start">
                <div className="flex flex-col items-center mx-auto sm:mx-0">
                  <div className={`relative h-32 w-28 bg-black/40 border rounded-2xl overflow-hidden shadow-inner flex items-center justify-center ${
                    record.verification_status === 'verified' ? 'border-emerald-400' : 'border-emerald-500/25'
                  }`}>
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="Foto Petani" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-3 text-emerald-500/35">
                        <User size={40} className="mx-auto mb-1.5 opacity-60" />
                        <span className="text-[8px] font-mono tracking-wider font-semibold">UNGGAH FOTO</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-left">
                  <div>
                    <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">NAMA LENGKAP PETANI</span>
                    <span className="text-base font-extrabold text-white uppercase mt-0.5 flex items-center gap-1.5 leading-none">
                      {cardFarmerName}
                      {record.verification_status === 'verified' && (
                        <span className="inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Verified Farmer Profile">
                          <Check size={11} className="stroke-[4]" />
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">KOPERASI MITRA</span>
                      <span className="font-bold text-emerald-100 uppercase block truncate">{cardCooperativeName}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">LUAS LAHAN</span>
                      <span className="font-bold text-emerald-100 block truncate">{cardAreaHectare} Hektar</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">ALAMAT LAHAN KEBUN</span>
                    <span className="text-emerald-100/90 block leading-tight font-medium">
                      Desa {cardVillage}, Kec. {cardDistrict}, {cardProvince}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-emerald-950/80 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">KODE PODGE-ID / FARM-ID</span>
                      <span className="font-mono text-xs font-extrabold text-white tracking-widest uppercase block mt-0.5">{cardFarmId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with Single Verification Barcode & Affiliations */}
              <div className="mt-6 pt-4 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left text-[9px] text-emerald-400/50 font-mono leading-relaxed max-w-[280px] space-y-1">
                  <p>Scan barcode publik ini untuk memeriksa koordinat kebun, berat kiriman TBS, dan status verifikasi hukum secara publik.</p>
                  <p className="text-[8px] text-emerald-300 font-sans mt-1">Dicetak oleh: PODGE & Badan Pengelola Dana Perkebunan (BPDP)</p>
                </div>
                
                <div className="bg-white p-2 rounded-xl border border-emerald-500/20 shrink-0 shadow-lg text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl(publicLink)} alt="Public QR Code" className="h-24 w-24 mx-auto" />
                  <span className="text-[7px] font-mono text-black font-bold tracking-widest block mt-1 uppercase">VERIFIED LAHAN</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-emerald-900/60 bg-black/25 p-8 text-center text-sm text-emerald-200/50 max-w-[500px] mx-auto">
              Memuat Kartu Identitas Digital Petani...
            </div>
          )}
        </div>

        {/* View mode actions */}
        {record && (
          <div className="w-full max-w-[500px] flex flex-wrap gap-3 items-center justify-center bg-black/30 p-4 rounded-2xl border border-emerald-950/80 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3 text-xs font-bold transition shadow-md"
            >
              <Printer size={15} />
              <span>Cetak Kartu (PDF)</span>
            </button>

            <button
              type="button"
              onClick={downloadCardAsJpg}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/20 hover:bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-50 transition"
            >
              <FileText size={15} />
              <span>Unduh Kartu (JPG)</span>
            </button>

            <button
              type="button"
              onClick={() => copyText(publicLink)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/20 hover:bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-50 transition"
              title="Salin Link Kartu"
            >
              <Copy size={15} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- RENDERING FULL BUILD/EDIT MODE (FOR FARMER LOGGED IN INTERFACE) ---
  return (
    <div className="space-y-8">
      
      {/* Dynamic media print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: #000 !important;
            color: #fff !important;
          }
          header, footer, nav, aside, button, label, input, form, select, textarea, .glass-panel:not(#printable-farmer-card-section) {
            display: none !important;
            visibility: hidden !important;
          }
          #printable-farmer-card-section {
            width: 100% !important;
            max-width: 500px !important;
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Page Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            <Fingerprint size={14} />
            FarmID Petani
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">Sertifikasi & KTP Digital Petani</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60">
            {hasLinkedFarmId
              ? 'FarmID Anda sudah terhubung. Lihat kartu anggota, unggah foto, atau bagikan link verifikasi publik.'
              : 'Dapatkan satu Kartu Identitas Digital Petani yang didukung oleh BPDP dan terverifikasi KYC.'}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-emerald-700/60 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:bg-emerald-950/60"
        >
          Kembali ke Dashboard
        </Link>
      </div>

      {status && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-100 flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showRegisterPrompt && (
        <section className="glass-panel rounded-2xl border border-yellow-500/25 bg-yellow-950/10 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0 text-yellow-300" size={20} />
              <div>
                <h2 className="font-space text-xl font-bold text-yellow-100">Daftar dulu sebelum membuat FarmID</h2>
                <p className="mt-1 text-sm leading-6 text-yellow-100/70">
                  Mulai sekarang FarmID hanya bisa dibuat oleh user yang sudah terdaftar dan masuk ke akun PODGE-ID.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-400"
              >
                Daftar Sekarang
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-700/60 px-4 py-2.5 text-xs font-bold text-emerald-50 transition hover:bg-emerald-950/60"
              >
                Sudah Terdaftar, Masuk
              </Link>
            </div>
          </div>
        </section>
      )}

      {showRolePrompt && (
        <section className="glass-panel rounded-2xl border border-yellow-500/25 bg-yellow-950/10 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 shrink-0 text-yellow-300" size={20} />
            <div>
              <h2 className="font-space text-xl font-bold text-yellow-100">FarmID khusus akun Petani</h2>
              <p className="mt-1 text-sm leading-6 text-yellow-100/70">
                Akun yang sedang masuk bukan akun Petani Mandiri. Silakan gunakan akun petani untuk mengisi data lahan FarmID.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid: Form on left, Card Visual & Controls on right */}
      <div className={`grid gap-8 ${showRegistrationForm ? 'xl:grid-cols-[1fr_1.1fr]' : 'xl:grid-cols-1'}`}>
        
        {/* Left Column: Register Form */}
        {showRegistrationForm && (
        <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-black">
              <Sprout size={22} />
            </div>
            <div>
              <h2 className="font-space text-xl font-bold text-emerald-50">Daftarkan Lahan Petani</h2>
              <p className="text-xs text-emerald-200/55">Isi data di bawah ini untuk dicetak langsung pada kartu.</p>
            </div>
          </div>

          <form onSubmit={generateFarmId} className="grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400">Nama Petani</span>
              <input
                type="text"
                name="farmerName"
                required
                value={formFarmerName}
                onChange={(e) => setFormFarmerName(e.target.value)}
                placeholder="Misal: Siti Rahma"
                className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400">Koperasi / Kelompok Tani Mitra</span>
              <input
                type="text"
                name="cooperativeName"
                required
                value={formCooperativeName}
                onChange={(e) => setFormCooperativeName(e.target.value)}
                placeholder="Misal: KUD Sawit Makmur"
                className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400">Desa</span>
                <input
                  type="text"
                  name="village"
                  required
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  placeholder="Misal: Sumber Sawit"
                  className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400">Kecamatan / Kabupaten</span>
                <input
                  type="text"
                  name="district"
                  required
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  placeholder="Misal: Pelalawan"
                  className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400">Provinsi</span>
                <input
                  type="text"
                  name="province"
                  required
                  value={formProvince}
                  onChange={(e) => setFormProvince(e.target.value)}
                  placeholder="Misal: Riau"
                  className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-emerald-400">Luas Lahan Kebun (ha)</span>
                <input
                  type="number"
                  step="0.01"
                  name="areaHectare"
                  required
                  value={formAreaHectare}
                  onChange={(e) => setFormAreaHectare(e.target.value)}
                  placeholder="2.50"
                  className="w-full rounded-xl border border-emerald-900/70 bg-black/40 p-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 text-sm font-extrabold transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses Lahan...' : 'Cetak & Terbitkan Kartu Digital'}
            </button>
          </form>
        </section>
        )}

        {/* Right Column: Interactive Digital Farmer ID Card Display */}
        <section className="flex flex-col items-center justify-center space-y-6">
          
          <div id="printable-farmer-card-section" className="w-full">
            
            {/* STYLISH ID CARD */}
            <div className="w-full max-w-[500px] mx-auto bg-gradient-to-br from-[#06150d] via-[#020704] to-[#0c2415] border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden font-space transition-all duration-300 hover:border-emerald-500/50">
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600"></div>
              <div className="absolute bottom-3 right-4 text-[9px] font-mono text-emerald-500/25 tracking-widest font-semibold">SECURE DIGITAL CARD</div>

              {/* Card Header */}
              <div className="flex justify-between items-start pb-4 border-b border-emerald-950/80">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black text-base shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white tracking-wider uppercase leading-none font-space">PODGE SAWIT</h4>
                    <span className="text-[8px] font-mono text-emerald-400 tracking-widest uppercase">Ecosystem Identity</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-0.5 rounded-md uppercase">
                    PETANI MANDIRI
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-[115px_1fr] gap-5 items-start">
                <div className="flex flex-col items-center mx-auto sm:mx-0">
                  <div className="relative h-32 w-28 bg-black/40 border border-emerald-500/25 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="Foto Petani" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-3 text-emerald-500/35">
                        <User size={40} className="mx-auto mb-1.5 opacity-60" />
                        <span className="text-[8px] font-mono tracking-wider font-semibold">UNGGAH FOTO</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-left">
                  <div>
                    <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">NAMA LENGKAP PETANI</span>
                    <span className="text-base font-extrabold text-white uppercase mt-0.5 block truncate leading-none">{cardFarmerName}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">KOPERASI MITRA</span>
                      <span className="font-bold text-emerald-100 uppercase block truncate">{cardCooperativeName}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">LUAS LAHAN</span>
                      <span className="font-bold text-emerald-100 block truncate">{cardAreaHectare} Hektar</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">ALAMAT LAHAN KEBUN</span>
                    <span className="text-emerald-100/90 block leading-tight font-medium">
                      Desa {cardVillage}, Kec. {cardDistrict}, {cardProvince}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-emerald-950/80 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest block font-semibold">KODE PODGE-ID / FARM-ID</span>
                      <span className="font-mono text-xs font-extrabold text-white tracking-widest uppercase block mt-0.5">{cardFarmId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with Single Verification Barcode & Affiliations */}
              <div className="mt-6 pt-4 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left text-[9px] text-emerald-400/50 font-mono leading-relaxed max-w-[280px] space-y-1">
                  <p>Scan barcode publik ini untuk memeriksa koordinat kebun, berat kiriman TBS, dan status verifikasi hukum secara publik.</p>
                  <p className="text-[8px] text-emerald-300 font-sans mt-1 font-semibold">Dicetak oleh: PODGE & Badan Pengelola Dana Perkebunan (BPDP)</p>
                </div>
                
                <div className="bg-white p-2 rounded-xl border border-emerald-500/20 shrink-0 shadow-lg text-center">
                  {record ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrUrl(publicLink)} alt="Public QR Code" className="h-24 w-24 mx-auto" />
                  ) : (
                    <div className="h-24 w-24 mx-auto bg-black/10 border border-emerald-950/20 rounded-lg flex items-center justify-center text-emerald-500/40">
                      <QrCode size={34} className="opacity-40 animate-pulse" />
                    </div>
                  )}
                  <span className="text-[7px] font-mono text-black font-bold tracking-widest block mt-1 uppercase">VERIFIED LAHAN</span>
                </div>
              </div>

            </div>
          </div>

          {/* CARD CONTROLS */}
          {record ? (
            <div className="w-full max-w-[500px] flex flex-wrap gap-3 items-center justify-center bg-black/30 p-4 rounded-2xl border border-emerald-950/80">
              
              <label className="flex-grow min-w-[130px] flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 text-center">
                <Camera size={15} />
                <span>{photoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {photoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('');
                    localStorage.removeItem(`podge:farmid:photo:${record.farm_id}`);
                    void savePhotoToServer(null);
                  }}
                  className="p-3 rounded-xl border border-red-950 bg-red-950/20 text-red-400 hover:bg-red-900/20 hover:text-red-200 transition"
                  title="Hapus Foto"
                >
                  <Trash2 size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={() => copyText(publicLink)}
                className="flex-grow min-w-[130px] inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/20 hover:bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-50 transition"
              >
                <Copy size={15} />
                <span>Salin Link</span>
              </button>

              <button
                type="button"
                onClick={() => window.open(publicLink, '_blank')}
                className="flex-grow min-w-[150px] inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-3 text-xs font-bold text-emerald-50 transition"
              >
                <Eye size={15} />
                <span>Lihat Kartu Anggota</span>
              </button>

              <button
                type="button"
                onClick={downloadCardAsJpg}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/20 hover:bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-50 transition"
                title="Unduh JPG"
              >
                <FileText size={15} />
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/20 hover:bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-50 transition"
                title="Cetak PDF"
              >
                <Printer size={15} />
              </button>

            </div>
          ) : (
            <div className="w-full max-w-[500px] p-4 rounded-xl border border-dashed border-emerald-950/80 bg-black/10 text-center text-xs text-emerald-300/40 flex items-center gap-2 justify-center">
              <InfoIcon size={14} className="opacity-70" />
              <span>Lakukan generate untuk memunculkan tombol upload foto dan cetak.</span>
            </div>
          )}

          {/* Recovery Code */}
          {identityRecoveryCode && (
            <div className="w-full max-w-[500px] rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-xs leading-5 text-yellow-100">
              <p className="font-bold flex items-center gap-1.5 text-yellow-400 mb-1">
                <AlertCircle size={14} /> Recovery Code (Podge ID Pemulihan):
              </p>
              <p className="mt-1 font-mono break-all text-yellow-50 bg-black/30 p-2.5 rounded-lg border border-yellow-900/30 font-bold select-all tracking-wider text-center">{identityRecoveryCode}</p>
              <p className="text-[10px] text-yellow-300/60 mt-1.5 leading-normal">
                Gunakan kode pemulihan di atas untuk mereset token rahasia Podge ID Anda jika berpindah browser atau HP. Jangan dibagikan ke orang lain.
              </p>
            </div>
          )}
        </section>

      </div>

      {/* Tutorial Barcode Anggota */}
      <section className="glass-panel rounded-2xl border border-emerald-500/20 bg-emerald-950/5 p-6 md:p-8 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)] mt-4">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-3 border-b border-emerald-950 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <QrCode size={24} />
          </div>
          <div>
            <h2 className="font-space text-xl font-extrabold text-white">Panduan Barcode & Keterlacakan Anggota</h2>
            <p className="text-xs text-emerald-400/70 mt-0.5">Operasional satu Barcode multifungsi untuk keamanan dan kepraktisan Petani</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="space-y-3 p-4 rounded-xl border border-emerald-900/30 bg-black/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">01</span>
                <h3 className="font-space text-sm font-bold text-emerald-300">Satu Barcode Anggota</h3>
              </div>
              <p className="text-xs leading-relaxed text-emerald-100/60 mt-2">
                Kartu digital Anda memiliki **satu Barcode Publik** yang tertera pada Kartu Identitas Digital Petani di bagian atas. Barcode ini memiliki fungsi ganda: untuk pelacakan sawit oleh pembeli/pabrik, sekaligus untuk memicu pengiriman kode masuk (OTP) rahasia ke HP Anda.
              </p>
            </div>
            <div className="pt-4 border-t border-emerald-950/80 mt-4 text-[10px] text-emerald-300/80 leading-normal">
              ℹ️ Barcode yang dapat digunakan adalah barcode yang menyatu pada gambar Kartu Identitas Digital Petani Anda di bagian atas halaman ini.
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 p-4 rounded-xl border border-emerald-900/30 bg-black/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">02</span>
                <h3 className="font-space text-sm font-bold text-emerald-300">Masuk Aman via OTP HP</h3>
              </div>
              <p className="text-xs leading-relaxed text-emerald-100/60 mt-2">
                Saat Anda mengunggah screenshot atau foto Barcode Kartu ini di halaman login, sistem akan mengirimkan **6-digit Kode OTP** ke nomor WhatsApp / Telegram Anda yang terdaftar. Anda tidak perlu menghafal sandi atau token yang rumit!
              </p>
            </div>
            <div className="pt-4 border-t border-emerald-950/80 mt-4 text-[10px] text-emerald-300/80 leading-normal">
              💡 **Keamanan 2-Faktor**: Meskipun orang lain men-scan kartu Anda, mereka tidak akan bisa login karena kode masuk rahasia hanya dikirimkan langsung ke nomor HP pribadi Anda.
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 p-4 rounded-xl border border-emerald-900/30 bg-black/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">03</span>
                <h3 className="font-space text-sm font-bold text-emerald-300">Status Panen Ter-update</h3>
              </div>
              <p className="text-xs leading-relaxed text-emerald-100/60 mt-2">
                Setelah masuk, gunakan formulir di bawah ini untuk memperbarui **Status Panen** (seperti *"Siap Panen"* atau *"Terkirim ke Koperasi"*). Pembeli atau Pabrik Sawit yang memindai kartu Anda akan langsung melihat status panen terbaru secara real-time.
              </p>
            </div>
            <div className="rounded border border-emerald-950 bg-black/40 p-2.5 text-center text-[10px] text-emerald-300 font-mono mt-4 leading-relaxed">
              <span>Status KYC Lahan: </span>
              <span className="font-bold text-white uppercase">{record ? record.verification_status : 'PENDING'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Access and Governance Form (Only shown for private claim/edit flows) */}
      {showClaimPanel && (
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-space text-xl font-bold text-emerald-50">Status Klaim & Update Panen Publik</h2>
            <p className="mt-1 text-sm text-emerald-200/55">
              Kelola status panen Anda di halaman verifikasi publik melalui panel edit ini.
            </p>
          </div>
          {record && (
            <button
              type="button"
              onClick={() => readFarmId(record.farm_id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 px-4 py-2.5 text-xs font-bold text-emerald-50 transition hover:bg-emerald-950/60"
            >
              <RefreshCcw size={14} />
              Segarkan Data
            </button>
          )}
        </div>

        {record ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            
            {/* View status parameters */}
            <div className="rounded-xl border border-emerald-900/60 bg-black/25 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-950/80">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">FarmID</p>
                  <p className="mt-1 break-all font-mono text-sm font-extrabold text-white tracking-widest">{record.farm_id}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-mono font-bold uppercase ${
                    record.public_status === 'live'
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
                  }`}>
                    {record.public_status === 'live' ? 'Live Public' : 'Draft'}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-mono font-bold uppercase ${
                    record.is_claimed
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-yellow-400/40 bg-yellow-500/15 text-yellow-200'
                  }`}>
                    {record.is_claimed ? 'Sudah Diklaim' : 'Belum Diklaim'}
                  </span>
                </div>
              </div>

              {/* Data elements */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 text-xs">
                <Info label="Petani / Pemilik Lahan" value={record.farmer_name} />
                <Info label="Koperasi Kelompok Tani" value={record.cooperative_name} />
                <Info label="Alamat Kebun" value={`${record.village}, ${record.district}, ${record.province}`} />
                <Info label="Total Luas Lahan" value={`${record.area_hectare} ha`} />
                <Info label="Komoditas Utama" value={record.commodity} />
                <Info label="Status Panen Saat Ini" value={record.harvest_status} />
                <Info
                  label="Terakhir Publish"
                  value={record.public_live_at ? new Date(record.public_live_at).toLocaleString('id-ID') : 'Belum dipublikasikan'}
                />
                <Info
                  label="Status Verifikasi Audit (KYC)"
                  value={record.verification_status.toUpperCase()}
                />
              </div>

              {/* Detailed KYC Status alert box (Auditor/BPDP status) */}
              <div className="mt-4">
                {record.verification_status === 'verified' ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/40 p-4 text-xs text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-400">VERIFIKASI KYC LOLOS / VALID</p>
                      <p className="mt-0.5 text-emerald-300/70">
                        Kartu identitas ini telah sah diverifikasi oleh verifikator BPDPKS & PODGE. Luas kebun, koperasi mitra, dan koordinat wilayah dinyatakan valid.
                      </p>
                      {record.verification_note && (
                        <p className="mt-2 font-mono text-[10px] text-emerald-400/80 bg-black/30 p-2 rounded">
                          Catatan Audit: {record.verification_note}
                        </p>
                      )}
                    </div>
                  </div>
                ) : record.verification_status === 'rejected' ? (
                  <div className="rounded-xl border border-red-500/25 bg-red-950/20 p-4 text-xs text-red-200 flex items-start gap-2.5">
                    <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-400">VERIFIKASI KYC DITOLAK</p>
                      <p className="mt-0.5 text-red-300/70">
                        Ditemukan ketidakcocokan data. Hubungi admin koperasi verifikator untuk memperbaiki info lahan.
                      </p>
                      {record.verification_note && (
                        <p className="mt-2 font-mono text-[10px] text-red-400/80 bg-black/30 p-2 rounded">
                          Alasan Penolakan: {record.verification_note}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-xs text-yellow-200 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-bold text-yellow-400">PROSES KYC (MENUNGGU VERIFIKASI)</p>
                      <p className="mt-0.5 text-yellow-300/70">
                        Kartu digital telah diterbitkan oleh petani namun masih menunggu verifikasi dokumen fisik oleh Auditor BPDPKS & PODGE.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Private Controls Form */}
            <div className="rounded-xl border border-emerald-900/60 bg-black/25 p-5">
              <div className="mb-4 flex items-start gap-3">
                <KeyRound className="mt-0.5 text-emerald-300 shrink-0" size={20} />
                <div>
                  <h3 className="font-space text-base font-bold text-emerald-50">Pengaturan Akses Edit</h3>
                  <p className="text-[11px] leading-relaxed text-emerald-200/55">
                    Hanya perangkat pengklaim pertama dengan token yang sah yang diperbolehkan mengubah status panen.
                  </p>
                </div>
              </div>

              {isClaimMode && access.canClaim && (
                <button
                  type="button"
                  onClick={claimFarmId}
                  disabled={loading}
                  className="mb-4 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black py-3 text-xs font-bold transition shadow-md"
                >
                  Klaim Hak Milik di HP/Browser Ini
                </button>
              )}

              {access.canEdit ? (
                <form onSubmit={updateFarmId} className="space-y-4">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Akses Tulis Terverifikasi.
                    </p>
                    <p className="mt-0.5 text-[10px] text-emerald-200/60">
                      Anda berhak melakukan perubahan panen secara langsung ke publik.
                    </p>
                  </div>
                  
                  <label className="block text-xs">
                    <span className="mb-1 block text-emerald-200/70 font-semibold">Ubah Status Panen Anda</span>
                    <select
                      value={harvestStatus}
                      onChange={(event) => setHarvestStatus(event.target.value)}
                      className="w-full rounded-lg border border-emerald-900/70 bg-black/40 p-2.5 text-xs text-emerald-50 outline-none transition focus:border-emerald-500"
                    >
                      <option>Belum ada update panen</option>
                      <option>Siap Panen</option>
                      <option>Panen Berjalan</option>
                      <option>Terkirim ke Koperasi</option>
                      <option>Terverifikasi</option>
                    </select>
                  </label>
                  
                  <label className="block text-xs">
                    <span className="mb-1 block text-emerald-200/70 font-semibold">Catatan Tambahan Panen</span>
                    <textarea
                      value={publicNote}
                      onChange={(event) => setPublicNote(event.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-emerald-900/70 bg-black/40 p-2.5 text-xs text-emerald-50 outline-none transition focus:border-emerald-500"
                      placeholder="Contoh: Sudah panen 2 ton TBS, sedang menunggu truk koperasi."
                    />
                  </label>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 text-xs font-bold transition"
                  >
                    Simpan Perubahan Publik
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-xs leading-5 text-yellow-200/80">
                  <div className="mb-1 flex items-center gap-1.5 font-bold text-yellow-400">
                    <ShieldAlert size={14} />
                    Akses Tulis Dikunci
                  </div>
                  {record.is_claimed
                    ? 'FarmID ini sudah diklaim di perangkat lain. Anda tidak bisa mengedit data publik ini.'
                    : 'Gunakan barcode private di HP pemilik lahan untuk membuktikan akses klaim edit.'}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-emerald-900/50 bg-black/20 p-8 text-center text-xs text-emerald-300/40">
            Daftarkan lahan baru di atas untuk memantau status klaim dan mengedit status panen.
          </div>
        )}
      </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-900/50 bg-black/35 p-3 flex flex-col justify-center">
      <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/60 font-semibold">{label}</p>
      <p className="mt-1 text-xs font-bold text-emerald-50 truncate">{value}</p>
    </div>
  );
}
