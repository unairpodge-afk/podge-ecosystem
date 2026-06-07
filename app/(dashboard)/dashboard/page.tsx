import { getIdentitySession } from '@/lib/identity';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TokenManager from './token-manager';
import DownstreamViewer from './downstream-viewer';
import HumaneAICompanion from '@/app/components/humane-ai-companion';
import {
  Fingerprint,
  Layers,
  ShieldCheck,
  Coins,
  TrendingUp,
  User,
  Building2,
  ArrowRight,
  Scale,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  Eye
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const identity = await getIdentitySession();

  // If not logged in, redirect to login page
  if (!identity) {
    redirect('/login');
  }

  const role = identity.identity_type;

  // Initialize data variables
  let totalLogsCount = 0;
  let totalSukukCount = 0;
  let totalComplianceCount = 0;
  let farmRecord: any = null;
  let farmerLogs: any[] = [];
  let farmerCertifications: any[] = [];
  
  // Additional industrial metrics for farmer
  let totalWeight = 0;
  let pricePremiumPerKg = 0;
  let totalPremiumEarned = 0;
  let isSustainable = false;
  let esgScore = 0;
  let completedChecks = 0;
  let checklist = { stdb: false, sppl: false, geofence: false, coop: false };

  // 1. Fetch details if it is a Farmer
  if (role === 'farmer') {
    // Check if they have linked a farm ID
    if (identity.linked_farm_id) {
      try {
        const farmRes = await query('SELECT * FROM farmer_ids WHERE farm_id = $1 LIMIT 1', [identity.linked_farm_id]);
        farmRecord = farmRes.rows[0] || null;
      } catch (err) {
        console.error('Gagal mengambil data farmer_ids:', err);
      }
    }

    // Query ONLY logs belonging to this farmer (by display name or farm's name)
    try {
      const logsRes = await query(
        `SELECT id, batch_id, farmer_name, tbs_weight_kg, pks_destination as location, blockchain_hash, status, created_at 
         FROM traceability_logs 
         WHERE LOWER(farmer_name) = LOWER($1) OR (LOWER(farmer_name) = LOWER($2))
         ORDER BY created_at DESC LIMIT 10`,
        [identity.display_name, farmRecord?.farmer_name || '']
      );
      farmerLogs = logsRes.rows;
      totalLogsCount = farmerLogs.length;
      totalWeight = farmerLogs.reduce((acc, log) => acc + Number(log.tbs_weight_kg), 0);
    } catch (err) {
      console.error('Gagal mengambil data logs untuk petani:', err);
    }

    // Query ONLY compliance/certifications specific to this farmer or their cooperative
    try {
      const certRes = await query(
        `SELECT id, company_name, certification_type, status, audit_score, audit_date 
         FROM compliance_evaluations 
         WHERE LOWER(company_name) = LOWER($1) OR LOWER(company_name) = LOWER($2)
         ORDER BY audit_date DESC`,
        [identity.display_name, farmRecord?.cooperative_name || '']
      );
      farmerCertifications = certRes.rows;
    } catch (err) {
      console.error('Gagal mengambil data sertifikasi compliance:', err);
    }

    isSustainable = farmRecord?.verification_status === 'verified' || farmRecord?.public_status === 'Terverifikasi' || farmRecord?.public_status === 'live' || farmerCertifications.length > 0;
    pricePremiumPerKg = isSustainable ? 400 : 0; // Rp 400 premium per Kg for sustainable certified palm
    totalPremiumEarned = totalWeight * pricePremiumPerKg;

    checklist = {
      stdb: !!farmRecord?.farm_id,
      sppl: !!farmRecord?.farm_id,
      geofence: farmRecord?.verification_status === 'verified' || farmRecord?.public_status === 'Terverifikasi' || farmRecord?.public_status === 'live',
      coop: !!farmRecord?.cooperative_name
    };
    completedChecks = Object.values(checklist).filter(Boolean).length;
    esgScore = Math.round((completedChecks / 4) * 100);
  } else {
    // 2. Fetch global statistics for admin/company/investor dashboards
    try {
      const sukukRes = await query('SELECT COUNT(*) FROM green_sukuk_projects');
      totalSukukCount = parseInt(sukukRes.rows[0].count, 10);
    } catch {}

    try {
      const traceRes = await query('SELECT COUNT(*) FROM traceability_logs');
      totalLogsCount = parseInt(traceRes.rows[0].count, 10);
    } catch {}

    try {
      const compRes = await query("SELECT COUNT(*) FROM compliance_evaluations WHERE status = 'Terverifikasi'");
      totalComplianceCount = parseInt(compRes.rows[0].count, 10);
    } catch {}
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        <div className="flex items-center space-x-4">
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-black shrink-0 ${
            role === 'farmer' ? 'bg-emerald-500' : role === 'company' ? 'bg-blue-500' : 'bg-amber-500'
          }`}>
            {role === 'farmer' && <User size={28} />}
            {role === 'company' && <Building2 size={28} />}
            {role === 'investor' && <Coins size={28} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-space leading-none">
                Halo, {identity.display_name}
              </h1>
              <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                role === 'farmer' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : role === 'company' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {role === 'farmer' ? 'Petani' : role === 'company' ? 'Perusahaan' : 'Investor'}
              </span>
            </div>
            <p className="text-xs text-emerald-400/60 font-mono mt-1.5 tracking-wider font-semibold">
              Podge ID Anda: {identity.public_code}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400/80">Sesi Aktif Aman</span>
        </div>
      </div>

      {/* Role-Specific Content */}
      {role === 'farmer' && (
        <div className="space-y-8">
          {/* Petani Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Status FarmID</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">
                {farmRecord 
                  ? (farmRecord.verification_status === 'verified' ? 'Terverifikasi' 
                      : farmRecord.verification_status === 'rejected' ? 'Ditolak (Invalid)' 
                      : 'Menunggu Verifikasi')
                  : 'Belum Ada Klaim'}
              </p>
              <p className="text-xs text-emerald-200/55 mt-1">
                {farmRecord ? `ID Lahan: ${farmRecord.farm_id}` : 'Silakan klaim FarmID Anda'}
              </p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Setoran TBS</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{totalLogsCount} Batch</p>
              <p className="text-xs text-emerald-200/55 mt-1">{totalWeight.toLocaleString('id-ID')} Kg Total Volume</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Incentive Hijau</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-2 font-space">
                Rp {totalPremiumEarned.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-emerald-200/55 mt-1">Rp {pricePremiumPerKg}/Kg Premi Berkelanjutan</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Kesiapan ISPO/ESG</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{esgScore}%</p>
              <p className="text-xs text-emerald-200/55 mt-1">{completedChecks} dari 4 Syarat Terpenuhi</p>
            </div>
          </div>

          {/* New Section: Evaluasi Kepatuhan Sawit Berkelanjutan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Premium Premium card */}
            <div className="glass-panel rounded-xl p-6 border border-emerald-500/20 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-space flex items-center gap-2">
                  <Coins size={18} className="text-emerald-400" />
                  Kalkulator Premium Payout (Incentive Hijau)
                </h3>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                  Industrial Premium
                </span>
              </div>
              <p className="text-xs text-emerald-200/60 leading-relaxed">
                Pabrik Kelapa Sawit (PKS) memberikan harga beli premium lebih tinggi untuk TBS yang terbukti bebas deforestasi (EUDR-compliant) dan memiliki koordinat kebun (FarmID) yang valid.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-black/40 rounded-lg border border-emerald-950/80">
                  <span className="text-[9px] text-emerald-400 font-mono block">HARGA PASAR DASAR</span>
                  <span className="text-sm font-bold text-emerald-200/50 mt-1 block">Rp 2.450 / Kg</span>
                </div>
                <div className="p-3 bg-emerald-950/25 rounded-lg border border-emerald-500/20">
                  <span className="text-[9px] text-emerald-400 font-mono block">PREMI ESG (LAHAN OK)</span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 block">+ Rp 400 / Kg</span>
                </div>
                <div className="p-3 bg-black/40 rounded-lg border border-emerald-950/80">
                  <span className="text-[9px] text-emerald-400 font-mono block">HARGA SUSTAINABLE</span>
                  <span className="text-sm font-bold text-white mt-1 block">Rp 2.850 / Kg</span>
                </div>
              </div>
              <div className="p-3.5 bg-emerald-950/30 rounded-lg border border-emerald-900/40 text-xs flex items-center justify-between">
                <span className="text-emerald-200/80">Total Tambahan Pendapatan Bersih Anda:</span>
                <span className="font-extrabold text-base text-emerald-400">Rp {totalPremiumEarned.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Replanting Financing & ESG Checklist */}
            <div className="glass-panel rounded-xl p-6 border border-emerald-500/15 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-space flex items-center gap-2 mb-3">
                  <Scale size={16} className="text-emerald-400" />
                  Syarat Kepatuhan EUDR & ISPO
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-black/25 rounded border border-emerald-950">
                    <span className="text-emerald-200/70">Nomor Registrasi STDB</span>
                    <span className={`font-mono text-[10px] font-bold ${checklist.stdb ? 'text-emerald-400' : 'text-yellow-500'}`}>
                      {checklist.stdb ? '✔ Tersedia' : '✖ Dibutuhkan'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/25 rounded border border-emerald-950">
                    <span className="text-emerald-200/70">Dokumen Lingkungan (SPPL)</span>
                    <span className={`font-mono text-[10px] font-bold ${checklist.sppl ? 'text-emerald-400' : 'text-yellow-500'}`}>
                      {checklist.sppl ? '✔ Lengkap' : '✖ Dibutuhkan'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/25 rounded border border-emerald-950">
                    <span className="text-emerald-200/70">Validasi Geofence (EUDR)</span>
                    <span className={`font-mono text-[10px] font-bold ${checklist.geofence ? 'text-emerald-400' : 'text-yellow-500'}`}>
                      {checklist.geofence ? '✔ Deforestation-Free' : '✖ Menunggu Review'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/25 rounded border border-emerald-950">
                    <span className="text-emerald-200/70">Mitra Koperasi Terdaftar</span>
                    <span className={`font-mono text-[10px] font-bold ${checklist.coop ? 'text-emerald-400' : 'text-yellow-500'}`}>
                      {checklist.coop ? '✔ Terhubung' : '✖ Belum Terhubung'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs">
                <span className="text-emerald-200/50">Pembiayaan Replanting Sukuk:</span>
                <span className={`font-bold ${esgScore >= 75 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                  {esgScore >= 75 ? '✔ Kualifikasi Terbuka' : '✖ Lahan Belum Siap'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Petani Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-space">Aksi Utama Petani</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Klaim FarmID / Lihat Kartu Anggota Card */}
              <div className="group glass-panel rounded-xl p-6 border border-emerald-500/10 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    {farmRecord ? <Eye size={20} /> : <Fingerprint size={20} />}
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {farmRecord ? 'Lihat Kartu Anggota' : 'Klaim FarmID (Sertifikat Lahan)'}
                  </h4>
                  <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                    {farmRecord
                      ? 'Buka kartu identitas digital petani Anda untuk verifikasi, cetak, atau dibagikan ke koperasi dan mitra.'
                      : 'Daftarkan luas kebun dan koordinat desa sawit Anda agar buah sawit yang dipanen terjamin legalitasnya.'}
                  </p>
                  
                  {/* Tutorial Klaim FarmID / Kartu Anggota */}
                  <div className="mt-4 p-3 bg-emerald-950/35 border border-emerald-800/20 rounded-lg text-emerald-300 text-[11px] leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1 font-mono uppercase tracking-wider text-[9px] text-emerald-400">
                      <HelpCircle size={12} /> {farmRecord ? 'Menu Kartu Anggota:' : 'Tutorial Klaim Lahan:'}
                    </p>
                    {farmRecord
                      ? `FarmID ${farmRecord.farm_id} sudah terhubung. Klik tombol di bawah untuk melihat kartu anggota digital dan link verifikasi publik.`
                      : 'Klik tombol di bawah > Isi nama, nama koperasi mitra, luas kebun (Hektar) > Masukkan nama Desa, Kecamatan, Provinsi > Kirim klaim. Data ini akan mempermudah penjualan TBS Anda ke Pabrik Kelapa Sawit (PKS) ramah lingkungan.'}
                  </div>
                </div>
                
                <Link
                  href={farmRecord ? `/governance/farmid?mode=view&id=${encodeURIComponent(farmRecord.farm_id)}` : '/governance/farmid'}
                  className="mt-5 inline-flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg text-xs transition-colors gap-1 shadow-md"
                >
                  <span>{farmRecord ? 'Lihat Kartu Anggota' : 'Klaim FarmID'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Catat Kiriman TBS Card */}
              <div className="group glass-panel rounded-xl p-6 border border-emerald-500/10 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Layers size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Catat Kiriman TBS (Buah Sawit)</h4>
                  <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                    Catat pengiriman hasil panen buah sawit segar Anda ke Pabrik PKS agar terdaftar otomatis di ketertelusuran digital.
                  </p>

                  {/* Tutorial Catat Kiriman */}
                  <div className="mt-4 p-3 bg-emerald-950/35 border border-emerald-800/20 rounded-lg text-emerald-300 text-[11px] leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1 font-mono uppercase tracking-wider text-[9px] text-emerald-400">
                      <HelpCircle size={12} /> Tutorial Catat TBS:
                    </p>
                    Klik tombol di bawah &gt; Masukkan berat TBS yang dipanen (dalam Kg) &gt; Pilih Pabrik Kelapa Sawit (PKS) tujuan &gt; Simpan batch. Sistem akan memproses data dan menghasilkan QR Code tanda bukti ketertelusuran.
                  </div>
                </div>
                
                <Link href="/governance/traceability" className="mt-5 inline-flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg text-xs transition-colors gap-1 shadow-md">
                  <span>Catat Kiriman TBS</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Informasi Lahan & Sertifikasi Petani Mandiri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lokasi Kebun & Sertifikasi ISPO/RSPO */}
            <div className="glass-panel rounded-xl p-6 border border-emerald-500/15">
              <h3 className="text-base font-bold text-white font-space flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-emerald-400" />
                Informasi & Lokasi Kebun Sawit
              </h3>

              {farmRecord ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-black/35 rounded-lg border border-emerald-950">
                      <span className="text-[10px] text-emerald-400 font-mono block">LUAS LAHAN</span>
                      <span className="text-sm font-bold text-white mt-1 block">{farmRecord.area_hectare} Hektar</span>
                    </div>
                    <div className="p-3 bg-black/35 rounded-lg border border-emerald-950">
                      <span className="text-[10px] text-emerald-400 font-mono block">KOMODITAS</span>
                      <span className="text-sm font-bold text-white mt-1 block">{farmRecord.commodity}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-black/35 rounded-lg border border-emerald-950 text-xs">
                    <span className="text-[10px] text-emerald-400 font-mono block">LOKASI KEBUN</span>
                    <span className="text-sm font-bold text-white mt-1 block">
                      Desa {farmRecord.village}, Kec. {farmRecord.district}, Provinsi {farmRecord.province}
                    </span>
                  </div>

                  <div className="p-3 bg-black/35 rounded-lg border border-emerald-950 text-xs">
                    <span className="text-[10px] text-emerald-400 font-mono block">SERTIFIKASI MANDIRI (ISPO/RSPO)</span>
                    {farmerCertifications.length > 0 ? (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/25">
                          {farmerCertifications[0].certification_type}
                        </span>
                        <span className="text-xs text-emerald-400">Terverifikasi (Score: {farmerCertifications[0].audit_score})</span>
                      </div>
                    ) : (
                      <span className="text-sm text-emerald-300/60 mt-1 block">
                        Belum memiliki Sertifikasi ISPO/RSPO.
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-black/30 rounded-xl border border-dashed border-emerald-900/50">
                  <AlertCircle size={24} className="text-emerald-500/50 mx-auto mb-2" />
                  <p className="text-xs text-emerald-300/70">
                    Lahan Anda belum terhubung. Silakan gunakan menu <strong>Klaim FarmID</strong> untuk mendaftarkan lahan Anda.
                  </p>
                </div>
              )}

              {/* Tutorial Info Kebun & Sertifikasi */}
              <div className="mt-5 p-3.5 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-emerald-300 text-[11px] leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1 font-mono uppercase tracking-wider text-[9px] text-emerald-400">
                  <HelpCircle size={12} /> Informasi Sertifikasi & Lahan:
                </p>
                Sertifikasi ISPO (Indonesia Sustainable Palm Oil) / RSPO (Roundtable on Sustainable Palm Oil) bersifat opsional untuk petani mandiri, namun kebun dengan sertifikat aktif berhak memperoleh harga TBS premium yang lebih tinggi dari Koperasi.
              </div>
            </div>

            {/* Riwayat Panen Terakhir (Tanggal & Volume) */}
            <div className="glass-panel rounded-xl p-6 border border-emerald-500/15 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-space flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-emerald-400" />
                  Riwayat Panen & Setoran TBS
                </h3>

                {farmerLogs.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {farmerLogs.map((log: any) => (
                      <div key={log.id} className="p-3 bg-black/25 rounded-lg border border-emerald-950/80 flex items-center justify-between text-xs hover:border-emerald-800/40 transition-colors">
                        <div>
                          <p className="font-bold text-white tracking-wide">{log.batch_id}</p>
                          <p className="text-[10px] text-emerald-300/50 mt-0.5">
                            Tanggal: {new Date(log.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">{log.tbs_weight_kg} Kg</p>
                          <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 border ${
                            log.status === 'Terverifikasi' || log.status === 'Verified'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : log.status === 'Ditolak' || log.status === 'Rejected'
                              ? 'bg-red-500/10 text-red-300 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                          }`}>
                            {log.status === 'Terverifikasi' || log.status === 'Verified'
                              ? 'Terverifikasi'
                              : log.status === 'Ditolak' || log.status === 'Rejected'
                              ? 'Ditolak / Invalid'
                              : 'Menunggu Verifikasi'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 bg-black/30 rounded-xl border border-dashed border-emerald-900/50">
                    <AlertCircle size={24} className="text-emerald-500/50 mx-auto mb-2" />
                    <p className="text-xs text-emerald-300/70">
                      Belum ada catatan setoran panen. Gunakan menu <strong>Catat Kiriman TBS</strong> untuk memulai setoran pertama Anda.
                    </p>
                  </div>
                )}
              </div>

              {/* Tutorial Riwayat Panen */}
              <div className="mt-4 p-3.5 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-emerald-300 text-[11px] leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1 font-mono uppercase tracking-wider text-[9px] text-emerald-400">
                  <HelpCircle size={12} /> Catatan Panen Mandiri:
                </p>
                Bagian ini memantau status pengiriman TBS Anda. Status <strong>Terverifikasi</strong> artinya pengiriman telah disetujui oleh verifikator. Status <strong>Menunggu Verifikasi</strong> berarti kiriman Anda sedang dalam proses audit timbangan, dan status <strong>Ditolak / Invalid</strong> menandakan adanya ketidaksesuaian data.
              </div>
            </div>

          </div>

          {/* Token Manager Section */}
          <TokenManager
            publicCode={identity.public_code}
            farmId={identity.linked_farm_id}
          />
          
          {/* Humane AI Companion Widget */}
          <HumaneAICompanion farmerName={identity.display_name} />
        </div>
      )}

      {role === 'company' && (
        <div className="space-y-8">
          {/* Perusahaan Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-blue-950">
              <p className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">Batch TBS Terverifikasi</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{totalLogsCount} Batch</p>
              <p className="text-xs text-blue-200/55 mt-1">Total pengiriman TBS masuk pabrik</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-blue-950">
              <p className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">Rasio Kepatuhan NDPE/ESG</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">94.8%</p>
              <p className="text-xs text-blue-200/55 mt-1">Memenuhi kriteria bebas deforestasi</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-blue-950">
              <p className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">Green Sukuk Portfolio</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{totalSukukCount} Proyek</p>
              <p className="text-xs text-blue-200/55 mt-1">Proyek pembiayaan hijau terdaftar</p>
            </div>
          </div>

          {/* Perusahaan Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-space">Aksi Cepat Perusahaan</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <Link href="/governance/traceability" className="group glass-panel rounded-xl p-6 border border-blue-500/10 hover:border-blue-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                    <Layers size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Validasi Blockchain Traceability</h4>
                  <p className="text-xs text-blue-100/60 mt-1 leading-relaxed">
                    Konfirmasi penerimaan TBS dari petani / koperasi sawit mitra dan simpan riwayat di blockchain ledger.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-blue-400 gap-1">
                  <span>Verifikasi TBS Masuk</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link href="/governance/compliance" className="group glass-panel rounded-xl p-6 border border-blue-500/10 hover:border-blue-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Evaluasi ESG & ISPO</h4>
                  <p className="text-xs text-blue-100/60 mt-1 leading-relaxed">
                    Audit kepatuhan kelestarian mitra pemasok buah kelapa sawit terhadap regulasi NDPE/ISPO/RSPO.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-blue-400 gap-1">
                  <span>Kelola Kepatuhan ESG</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link href="/value-creation/green-sukuk" className="group glass-panel rounded-xl p-6 border border-blue-500/10 hover:border-blue-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                    <Coins size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Sukuk Pembiayaan Hijau</h4>
                  <p className="text-xs text-blue-100/60 mt-1 leading-relaxed">
                    Kelola alokasi dana pendanaan syariah dari portofolio Green Sukuk untuk proyek dekarbonisasi sawit.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-blue-400 gap-1">
                  <span>Lihat Alokasi Sukuk</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Downstream supply chain visualization for PKS */}
          <div className="border-t border-blue-950/40 pt-6">
            <DownstreamViewer identity={identity} />
          </div>
        </div>
      )}

      {role === 'investor' && (
        <div className="space-y-8">
          {/* Investor Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-amber-950">
              <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Total Nilai Investasi</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">Rp120,500,000</p>
              <p className="text-xs text-amber-200/55 mt-1">Investasi Green Sukuk Aktif</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-amber-950">
              <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Pengurangan Karbon (Offset)</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">42.5 tCO2e</p>
              <p className="text-xs text-amber-200/55 mt-1">Estimasi dampak pelestarian hutan sawit</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-amber-950">
              <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Proyek Didukung</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{totalSukukCount} Proyek</p>
              <p className="text-xs text-amber-200/55 mt-1">Proyek sertifikasi & penanaman kembali</p>
            </div>
          </div>

          {/* Investor Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-space">Aksi Cepat Investor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/value-creation/green-sukuk" className="group glass-panel rounded-xl p-6 border border-amber-500/10 hover:border-amber-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <Coins size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Beli Green Sukuk Baru</h4>
                  <p className="text-xs text-amber-100/60 mt-1 leading-relaxed">
                    Temukan dan beli instrumen investasi Green Sukuk syariah untuk perkebunan kelapa sawit ramah lingkungan.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-amber-400 gap-1">
                  <span>Lihat Pasar Sukuk</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link href="/governance/compliance" className="group glass-panel rounded-xl p-6 border border-amber-500/10 hover:border-amber-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Kepatuhan ESG Perkebunan</h4>
                  <p className="text-xs text-amber-100/60 mt-1 leading-relaxed">
                    Periksa verifikasi ISPO, RSPO, dan NDPE pada entitas mitra yang menerima aliran investasi sukuk.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-amber-400 gap-1">
                  <span>Lihat Audit Kepatuhan</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link href="/impact/economic" className="group glass-panel rounded-xl p-6 border border-amber-500/10 hover:border-amber-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Laporan Dampak Nyata</h4>
                  <p className="text-xs text-amber-100/60 mt-1 leading-relaxed">
                    Lihat hasil nyata dekarbonisasi sawit dan peningkatan ekonomi riil bagi petani sawit mandiri mitra.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-amber-400 gap-1">
                  <span>Lihat Laporan Dampak</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Downstream supply chain visualization for Investor */}
          <div className="border-t border-amber-950/40 pt-6">
            <DownstreamViewer identity={identity} />
          </div>
        </div>
      )}

      {/* Shared Ecosystem Features section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-white font-space flex items-center gap-2">
          <Scale size={20} className="text-emerald-400" />
          Keadilan & Transparansi Ekosistem
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-6 flex items-start space-x-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Ketertelusuran Rantai Pasok Blockchain</h4>
              <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                Setiap batch TBS dienkripsi dengan SHA-256 untuk memvalidasi asal-usul buah sawit dari lahan non-deforestasi secara transparan.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 flex items-start space-x-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Scale size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Sertifikasi & Kepatuhan Hijau</h4>
              <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                Kebun mitra terverifikasi auditor independen untuk kepatuhan tata kelola NDPE dan ISPO secara adil tanpa membebani petani swadaya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
