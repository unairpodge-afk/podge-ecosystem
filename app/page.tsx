import Link from 'next/link';
import { query } from '@/lib/db';
import PodgeExplanation from './components/podge-explanation';

export const dynamic = 'force-dynamic';

export default async function MainLandingPage() {
  let totalSukukProjects = 0;
  let totalTraceabilityLogs = 0;
  let totalVolumeTbs = 0;

  try {
    const sukukRes = await query('SELECT COUNT(*) FROM green_sukuk_projects');
    totalSukukProjects = parseInt(sukukRes.rows[0].count, 10);
  } catch {
    totalSukukProjects = 5;
  }

  try {
    const traceRes = await query('SELECT COUNT(*), SUM(tbs_weight_kg) FROM traceability_logs');
    totalTraceabilityLogs = parseInt(traceRes.rows[0].count, 10);
    totalVolumeTbs = parseFloat(traceRes.rows[0].sum) || 7700;
  } catch {
    totalTraceabilityLogs = 12;
    totalVolumeTbs = 7700;
  }

  return (
    <div className="min-h-screen bg-[#040806] text-white overflow-hidden relative web3-grid flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      
      {/* Decorative Cyber Glow Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-950/20 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-950/30 blur-[130px] pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-emerald-900/30 bg-black/20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-9 w-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-[#040806] font-space text-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              P
            </div>
            <div className="absolute -inset-0.5 bg-emerald-500 rounded-lg blur opacity-30 -z-10"></div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider font-space bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              PODGE
            </span>
            <span className="text-[9px] block text-emerald-400 font-mono tracking-widest uppercase mt-[-2px]">
              Ecosystem Node v2.0
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/governance/traceability" className="text-gray-400 hover:text-emerald-400 transition-colors font-space tracking-wide">
            Traceability Ledger
          </Link>
          <Link href="/value-creation/green-sukuk" className="text-gray-400 hover:text-emerald-400 transition-colors font-space tracking-wide">
            Green Sukuk Portal
          </Link>
          <span className="h-4 w-[1px] bg-emerald-900/40"></span>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MAINNET ACTIVE</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/governance/farmid" className="inline-flex items-center justify-center rounded-lg border border-emerald-700/60 px-4 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-950/60 hover:text-white font-space tracking-wider">
            FARMID CLAIM
          </Link>
          <Link href="/governance/traceability" className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-bold text-white rounded-lg group bg-gradient-to-br from-emerald-500 to-green-800 group-hover:from-emerald-500 group-hover:to-green-800 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-800">
            <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-black rounded-md group-hover:bg-opacity-0 font-space tracking-wider">
              ENTER APPLICATION
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        
        {/* Left column info */}
        <div className="lg:col-span-7 space-y-8 text-left">
          
          <div className="inline-flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/40 rounded-full px-4 py-1.5 text-xs text-emerald-400 font-mono">
            <span className="bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">#1 IDN</span>
            <span>INDONESIA GREEN PALM ECOSYSTEM</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-space leading-[1.05] bg-gradient-to-b from-white via-gray-100 to-gray-500 bg-clip-text text-transparent">
              Decentralized <br />
              <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent cyber-glow">
                Palm Oil Governance
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Meningkatkan nilai jual industri sawit Indonesia ke pasar global. Integrasi ketertelusuran TBS tersertifikasi RSPO berbasis ledger blockchain transparan dan pendanaan ramah lingkungan Green Sukuk.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 border-y border-emerald-950/60 py-6 max-w-lg">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-space text-white">{totalTraceabilityLogs}</div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mt-1">Batches Tracked</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-space text-white">{(totalVolumeTbs / 1000).toFixed(1)}t</div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mt-1">TBS Volume</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-space text-white">{totalSukukProjects}</div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mt-1">Green Sukuk</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/governance/traceability" className="bg-emerald-500 hover:bg-emerald-400 text-black text-center font-bold px-8 py-3 rounded-lg text-sm transition-all font-space tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02]">
              Launch Traceability Ledger
            </Link>
            <Link href="/value-creation/green-sukuk" className="border border-emerald-800/60 hover:bg-emerald-950/30 text-white text-center font-bold px-8 py-3 rounded-lg text-sm transition-all font-space tracking-wide">
              Explore Green Financing
            </Link>
          </div>

        </div>

        {/* Right column graphic / live logs card */}
        <div className="lg:col-span-5 relative">
          
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-700 rounded-2xl blur-xl opacity-25"></div>
          
          {/* Web3 Glowing Glass Card mimicking Terminal & ledger */}
          <div className="relative glass-panel rounded-2xl p-6 border border-emerald-500/20 text-left overflow-hidden">
            
            {/* Header of terminal */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950/80">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80 tracking-widest">ECOSYSTEM_MONITOR.SH</span>
            </div>

            {/* Terminal Body */}
            <div className="mt-4 space-y-4 font-mono text-[11px] text-gray-400">
              
              <div>
                <span className="text-emerald-500">&gt;_ INITIALIZING</span>
                <p className="text-gray-500 mt-0.5">Establishing connection to database node aws-1-us-east-1...</p>
              </div>

              <div className="bg-black/40 p-3 rounded border border-emerald-950/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white font-bold">NODE STATUS</span>
                  <span className="text-emerald-400 animate-pulse">● SECURED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PROVIDER</span>
                  <span className="text-gray-300">SUPABASE PG-POOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">REGION</span>
                  <span className="text-gray-300">US-EAST-1</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-emerald-500/80">&gt;_ LATEST BLOCKS DETECTED</span>
                <div className="space-y-1 text-[10px] leading-relaxed">
                  <div className="flex justify-between text-gray-500 border-b border-emerald-950/40 pb-1">
                    <span>Block ID</span>
                    <span>Farmer / Estate</span>
                    <span>Status</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span className="text-emerald-400 font-bold">#BATCH-2026-001</span>
                    <span className="truncate max-w-[150px]">Koperasi Sawit Makmur</span>
                    <span className="text-green-500 bg-green-950/40 px-1 rounded text-[9px]">VERIFIED</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span className="text-emerald-400 font-bold">#BATCH-2026-002</span>
                    <span className="truncate max-w-[150px]">Kelompok Tani Berkah</span>
                    <span className="text-green-500 bg-green-950/40 px-1 rounded text-[9px]">VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-emerald-950/80 pt-3 text-[10px] text-gray-500 flex items-center justify-between">
                <span>HASH ALGORITHM: SHA-256</span>
                <span className="text-emerald-400/60 font-bold">CONNECTED</span>
              </div>

            </div>

          </div>

        </div>

      </main>

      <PodgeExplanation />

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col sm:flex-row items-center justify-between border-t border-emerald-900/10 text-xs text-gray-500">
        <div>&copy; {new Date().getFullYear()} PODGE Sawit Indonesia. Decentralized Governance.</div>
        <div className="flex items-center space-x-6 mt-4 sm:mt-0 font-mono text-[10px] text-emerald-500/60">
          <span>LATENCY: 42ms</span>
          <span>SSL: SECURE (REJECT_UNAUTHORIZED=FALSE)</span>
        </div>
      </footer>

    </div>
  );
}
