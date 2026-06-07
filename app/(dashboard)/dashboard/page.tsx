import { getIdentitySession } from '@/lib/identity';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
  HelpCircle
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Status FarmID</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">
                {farmRecord ? 'Lahan Terhubung' : 'Belum Ada Klaim'}
              </p>
              <p className="text-xs text-emerald-200/55 mt-1">
                {farmRecord ? `ID: ${farmRecord.farm_id}` : 'Silakan klaim FarmID Anda'}
              </p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">TBS Disetor Anda</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{totalLogsCount} Batch</p>
              <p className="text-xs text-emerald-200/55 mt-1">Pengiriman TBS yang Anda catat</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Sertifikasi Mandiri</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">
                {farmerCertifications.length > 0 ? farmerCertifications[0].certification_type : 'Petani Swadaya'}
              </p>
              <p className="text-xs text-emerald-200/55 mt-1">
                {farmerCertifications.length > 0 ? 'Tersertifikasi ISPO/RSPO' : 'Tidak wajib ESG korporasi'}
              </p>
            </div>
          </div>

          {/* Section: Petani Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-space">Aksi Utama Petani</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Klaim FarmID Card */}
              <div className="group glass-panel rounded-xl p-6 border border-emerald-500/10 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Fingerprint size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Klaim FarmID (Sertifikat Lahan)</h4>
                  <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                    Daftarkan luas kebun dan koordinat desa sawit Anda agar buah sawit yang dipanen terjamin legalitasnya.
                  </p>
                  
                  {/* Tutorial Klaim FarmID */}
                  <div className="mt-4 p-3 bg-emerald-950/35 border border-emerald-800/20 rounded-lg text-emerald-300 text-[11px] leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1 font-mono uppercase tracking-wider text-[9px] text-emerald-400">
                      <HelpCircle size={12} /> Tutorial Klaim Lahan:
                    </p>
                    Klik tombol di bawah &gt; Isi nama, nama koperasi mitra, luas kebun (Hektar) &gt; Masukkan nama Desa, Kecamatan, Provinsi &gt; Kirim klaim. Data ini akan mempermudah penjualan TBS Anda ke Pabrik Kelapa Sawit (PKS) ramah lingkungan.
                  </div>
                </div>
                
                <Link href="/governance/farmid" className="mt-5 inline-flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg text-xs transition-colors gap-1 shadow-md">
                  <span>Klaim FarmID</span>
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
                            log.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                            log.status === 'Received' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                            'bg-lime-500/10 text-lime-300 border-lime-500/20'
                          }`}>
                            {log.status}
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
                Bagian ini memantau status pengiriman TBS Anda. Status <strong>Received</strong> artinya buah sawit sudah sampai dan ditimbang di pabrik. Koperasi akan otomatis mengalokasikan bagi hasil penjualan ke rekening terdaftar Anda.
              </div>
            </div>

          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
