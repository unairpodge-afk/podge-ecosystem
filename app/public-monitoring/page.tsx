import Link from 'next/link';
import { 
  Eye, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  Wind, 
  Sprout, 
  Leaf, 
  Users, 
  Factory,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const metadata = {
  title: 'Pengawasan Masyarakat - PODGE Ecosystem',
  description: 'Dashboard transparansi publik untuk memantau hasil panen, cuaca, dan kepatuhan perusahaan sawit.',
};

export default function PublicMonitoringPage() {
  const companies = [
    {
      id: 1,
      name: 'PT Borneo Palm Energy',
      location: 'Kalimantan Tengah',
      farmers: 124,
      totalYieldToday: '42.5 Ton',
      blockchainVerified: true,
      weather: 'Hujan Ringan (Aman)',
      soil: 'Subur (Kelembapan 65%)',
      esgScore: 92
    },
    {
      id: 2,
      name: 'PT Nusantara Sawit Lestari',
      location: 'Kalimantan Barat',
      farmers: 89,
      totalYieldToday: '28.1 Ton',
      blockchainVerified: true,
      weather: 'Panas Terik (Waspada Karhutla)',
      soil: 'Kering (Kelembapan 30%)',
      esgScore: 88
    },
    {
      id: 3,
      name: 'PT Khatulistiwa Agro',
      location: 'Kalimantan Timur',
      farmers: 156,
      totalYieldToday: '55.3 Ton',
      blockchainVerified: true,
      weather: 'Cerah Berawan',
      soil: 'Normal (Kelembapan 50%)',
      esgScore: 95
    }
  ];

  const recentTransactions = [
    { id: 'TX-892', farmer: 'Kelompok Tani Makmur (Bapak Yanto)', company: 'PT Borneo Palm Energy', weight: '850 Kg', time: '10 menit lalu', hash: '0x3a...f92' },
    { id: 'TX-891', farmer: 'Kelompok Tani Sejahtera (Ibu Sumiati)', company: 'PT Khatulistiwa Agro', weight: '1,200 Kg', time: '25 menit lalu', hash: '0x8b...a14' },
    { id: 'TX-890', farmer: 'Kelompok Tani Harapan (Bapak Joko)', company: 'PT Nusantara Sawit Lestari', weight: '640 Kg', time: '40 menit lalu', hash: '0x1c...e88' },
    { id: 'TX-889', farmer: 'Kelompok Tani Tunas (Bapak Budi)', company: 'PT Borneo Palm Energy', weight: '920 Kg', time: '1 jam lalu', hash: '0x9f...b22' },
    { id: 'TX-888', farmer: 'Kelompok Tani Jaya (Bapak Herman)', company: 'PT Khatulistiwa Agro', weight: '1,500 Kg', time: '1.5 jam lalu', hash: '0x4d...c71' }
  ];

  return (
    <div className="min-h-screen bg-[#040806] text-white">
      {/* Navbar Minimalist */}
      <nav className="border-b border-emerald-500/20 bg-emerald-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="text-black" size={20} />
            </div>
            <span className="font-space font-bold text-lg text-white">PODGE</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
              Live Monitoring
            </span>
            <Link href="/login" className="text-sm font-semibold text-emerald-100 hover:text-white">Login</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2">
            <Eye size={32} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-space tracking-tight">
            Pengawasan Masyarakat
          </h1>
          <p className="text-lg text-emerald-100/70 leading-relaxed">
            Transparansi penuh untuk memastikan kesejahteraan petani dan keberlanjutan lingkungan. Pantau hasil jerih payah petani secara langsung dari 3 perusahaan kelapa sawit di Kalimantan.
          </p>
        </div>

        {/* Company Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="glass-panel rounded-2xl p-6 border border-emerald-500/20 flex flex-col justify-between group hover:border-emerald-500/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <Factory size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold font-space text-white">{company.esgScore}</span>
                    <span className="text-[10px] text-emerald-400 font-mono uppercase">ESG Score</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold font-space text-white mb-1">{company.name}</h3>
                <p className="text-sm text-emerald-200/60 flex items-center gap-1.5 mb-6">
                  <MapPin size={14} /> {company.location}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-emerald-950">
                    <div className="flex items-center gap-2 text-emerald-100">
                      <Users size={16} className="text-emerald-500" />
                      <span className="text-sm">Petani Terdaftar</span>
                    </div>
                    <span className="font-bold font-mono">{company.farmers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-emerald-950">
                    <div className="flex items-center gap-2 text-emerald-100">
                      <Activity size={16} className="text-emerald-500" />
                      <span className="text-sm">Total TBS Hari Ini</span>
                    </div>
                    <span className="font-bold font-mono text-emerald-400">{company.totalYieldToday}</span>
                  </div>
                  
                  {/* Geo-spatial & Weather Mini-widget */}
                  <div className={`p-3 rounded-lg border flex flex-col gap-2 ${
                    company.weather.includes('Waspada') ? 'bg-orange-950/20 border-orange-500/30' : 'bg-emerald-950/20 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-100/70">
                        <Wind size={14} className={company.weather.includes('Waspada') ? 'text-orange-400' : 'text-blue-400'} /> Cuaca Area
                      </span>
                      <span className={company.weather.includes('Waspada') ? 'text-orange-400 font-bold' : 'text-blue-400 font-bold'}>{company.weather}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-100/70">
                        <Sprout size={14} className="text-emerald-500" /> Kesuburan Lahan
                      </span>
                      <span className="text-emerald-400 font-bold">{company.soil}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-950 flex items-center justify-between text-xs">
                <span className="text-emerald-200/50">Status Payout:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={14} /> Terjamin Smart Contract
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Blockchain Ledger Simulation */}
        <div className="glass-panel rounded-2xl p-8 border border-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold font-space text-white flex items-center gap-2">
                <Activity className="text-emerald-400" />
                Ledger Kesejahteraan Petani (Live)
              </h2>
              <p className="text-sm text-emerald-200/60 mt-1">Data setoran TBS terekam permanen untuk mencegah eksploitasi dan menjamin pembayaran adil.</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Node: Kalimantan Sync
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-emerald-950 text-emerald-400/70 font-mono text-xs">
                  <th className="pb-3 font-semibold">Waktu</th>
                  <th className="pb-3 font-semibold">Pihak Petani</th>
                  <th className="pb-3 font-semibold">Tujuan (PKS)</th>
                  <th className="pb-3 font-semibold">Volume TBS</th>
                  <th className="pb-3 font-semibold">Status Payout</th>
                  <th className="pb-3 font-semibold">Hash Bukti (On-Chain)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/50">
                {recentTransactions.map((tx, idx) => (
                  <tr key={tx.id} className="text-emerald-100 hover:bg-emerald-950/20 transition-colors">
                    <td className="py-4 text-xs text-emerald-300/60">{tx.time}</td>
                    <td className="py-4 font-semibold">{tx.farmer}</td>
                    <td className="py-4">{tx.company}</td>
                    <td className="py-4 font-bold text-emerald-400">{tx.weight}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Instan via Escrow
                      </span>
                    </td>
                    <td className="py-4 text-xs font-mono text-emerald-400/50">{tx.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational Section on Mitigation */}
        <div className="bg-gradient-to-r from-emerald-950/40 to-black rounded-2xl p-8 border border-emerald-900/50 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold font-space text-white flex items-center gap-2">
              <MapPin className="text-emerald-400" />
              Mitigasi Risiko Bencana & Geospasial
            </h3>
            <p className="text-sm text-emerald-100/70 leading-relaxed">
              Teknologi PODGE tidak hanya soal ekonomi. Kami memantau titik panas (hotspots) dan tingkat kelembapan tanah melalui integrasi satelit geospasial. Masyarakat dan pemerintah dapat bersama-sama mencegah risiko kebakaran hutan (Karhutla) dan menjaga agar lahan sawit tetap subur berkelanjutan.
            </p>
          </div>
          <div className="w-full md:w-1/3 bg-black/60 rounded-xl p-4 border border-emerald-950">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-yellow-500" size={20} />
              <span className="font-bold text-sm text-yellow-500">Peringatan Dini Aktif</span>
            </div>
            <p className="text-xs text-emerald-200/50 mb-3">Area Kab. Kapuas terdeteksi suhu 34°C. Peringatan telah dikirim via AI Companion ke 89 petani di sekitar area.</p>
            <div className="w-full bg-emerald-950/50 rounded-full h-1.5 mb-1">
              <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/50">Risiko Kekeringan: Sedang</span>
          </div>
        </div>

      </main>
    </div>
  );
}
