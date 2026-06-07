import { getIdentitySession } from '@/lib/identity';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Leaf,
  Fingerprint,
  Layers,
  ShieldCheck,
  Coins,
  TrendingUp,
  ArrowUpRight,
  User,
  Building2,
  Wallet,
  ArrowRight,
  Scale
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const identity = await getIdentitySession();

  // If not logged in, redirect to login page
  if (!identity) {
    redirect('/login');
  }

  // Fetch some metrics from database for dynamic display
  let totalSukukCount = 0;
  let totalLogsCount = 0;
  let totalComplianceCount = 0;

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

  const role = identity.identity_type;

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
            <p className="text-xs text-emerald-400/60 font-mono mt-1.5 tracking-wider">
              ID: {identity.public_code}
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
                {identity.linked_farm_id ? 'Terhubung' : 'Belum Klaim'}
              </p>
              <p className="text-xs text-emerald-200/55 mt-1">
                {identity.linked_farm_id ? `Farm ID: ${identity.linked_farm_id}` : 'Klaim FarmID Anda segera'}
              </p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">TBS Disetor</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{totalLogsCount} Batch</p>
              <p className="text-xs text-emerald-200/55 mt-1">Total pengiriman TBS terdaftar</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-emerald-950">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Sertifikasi ESG</p>
              <p className="text-2xl font-extrabold text-white mt-2 font-space">{totalComplianceCount} Aktif</p>
              <p className="text-xs text-emerald-200/55 mt-1">Status kelayakan perkebunan</p>
            </div>
          </div>

          {/* Petani Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-space">Aksi Cepat Petani</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/governance/farmid" className="group glass-panel rounded-xl p-6 border border-emerald-500/10 hover:border-emerald-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Fingerprint size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Klaim FarmID Sawit</h4>
                  <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                    Daftarkan titik koordinat lahan kebun sawit Anda agar terdaftar resmi dalam ekosistem hijau PODGE.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-emerald-400 gap-1">
                  <span>Buka Form Klaim</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link href="/governance/traceability" className="group glass-panel rounded-xl p-6 border border-emerald-500/10 hover:border-emerald-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Layers size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Catat Kiriman TBS</h4>
                  <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                    Ajukan pengiriman Buah Sawit (TBS) Anda ke PKS / Koperasi agar tercatat dalam blockchain ledger.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-emerald-400 gap-1">
                  <span>Lacak & Kirim TBS</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link href="/impact/economic" className="group glass-panel rounded-xl p-6 border border-emerald-500/10 hover:border-emerald-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Dampak Ekonomi & Nilai</h4>
                  <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                    Pantau grafik perkembangan pendapatan dan distribusi bagi hasil dari penjualan buah kelapa sawit berkelanjutan.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-emerald-400 gap-1">
                  <span>Lihat Grafik Dampak</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
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
        <h3 className="text-lg font-bold text-white font-space">Ringkasan Sistem Ekosistem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-6 flex items-start space-x-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Blockchain Ledger Rantai Pasok</h4>
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
                Setiap lahan petani diverifikasi oleh auditor independen untuk menjamin standar pelestarian lingkungan ISPO dan RSPO terpenuhi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
