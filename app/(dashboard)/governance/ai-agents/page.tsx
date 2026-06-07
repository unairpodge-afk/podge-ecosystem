'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Brain, Cpu, Terminal, ShieldAlert, CheckCircle2, XCircle, 
  Eye, Activity, FileText, RefreshCw, Play, ArrowRight, 
  Server, Settings, AlertCircle, MapPin, Sparkles, Coins,
  Truck, HelpCircle, ShieldCheck, DollarSign
} from 'lucide-react';

type AgentStatus = 'idle' | 'active' | 'success' | 'failed';

const COMPANIES = [
  { name: 'PT Borneo Palm Energy', region: 'Kalimantan Tengah', coords: '-2.215, 113.921', age: 14, fertilizer: 110, pricePremium: 400 },
  { name: 'PT Riau Agromakmur', region: 'Riau', coords: '0.534, 101.442', age: 10, fertilizer: 95, pricePremium: 420 },
  { name: 'PT Sumatera Palm Lestari', region: 'Sumatera Utara', coords: '3.595, 98.672', age: 18, fertilizer: 120, pricePremium: 380 }
];

export default function AIAgentsPage() {
  const [selectedComp, setSelectedComp] = useState(COMPANIES[0]);
  const [simulateDeforestation, setSimulateDeforestation] = useState(false);
  const [simulatePoorQuality, setSimulatePoorQuality] = useState(false);
  
  // Custom slider inputs
  const [ffbWeight, setFfbWeight] = useState(5000); // FFB harvest weight in kg
  const [ripeRatio, setRipeRatio] = useState(92);   // % of ripe fruit (Buah Matang/Brondolan)
  const [ffaLevel, setFfaLevel] = useState(3.1);     // Free Fatty Acid level %

  // Agent statuses
  const [inspectorStatus, setInspectorStatus] = useState<AgentStatus>('idle');
  const [auditorStatus, setAuditorStatus] = useState<AgentStatus>('idle');
  const [prosperityStatus, setProsperityStatus] = useState<AgentStatus>('idle');
  const [exportStatus, setExportStatus] = useState<AgentStatus>('idle');

  const [isRunning, setIsRunning] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [activeAgentName, setActiveAgentName] = useState<string>('System');
  
  // Simulation results
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<'pass' | 'fail' | null>(null);
  
  // Custom outputs
  const [harvestYield, setHarvestYield] = useState<string>('-');
  const [millCompliance, setMillCompliance] = useState<string>('-');
  const [farmerProsperity, setFarmerProsperity] = useState<string>('-');
  const [exportCargo, setExportCargo] = useState<string>('-');

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logLines]);

  const addLog = (line: string, agent: string) => {
    setActiveAgentName(agent);
    setLogLines(prev => [...prev, `[${agent.toUpperCase()}] ${line}`]);
  };

  const handleStartInference = () => {
    if (isRunning) return;

    setIsRunning(true);
    setPipelineFinished(false);
    setPipelineResult(null);
    setLogLines([]);
    
    setHarvestYield('-');
    setMillCompliance('-');
    setFarmerProsperity('-');
    setExportCargo('-');

    setInspectorStatus('active');
    setAuditorStatus('idle');
    setProsperityStatus('idle');
    setExportStatus('idle');

    let currentStep = 0;
    
    const runStep = () => {
      switch (currentStep) {
        case 0:
          addLog("SYSTEM: Menginisialisasi Podge-Nemesis AI Multi-Agent Ingestion Node v2.1...", "System");
          addLog("SYSTEM: Model kustom perkebunan kelapa sawit dimuat (Gemini-1.5-Pro).", "System");
          setTimeout(() => {
            addLog(`HARVEST_INSPECTOR: Menerima data timbangan TBS masuk sebesar ${ffbWeight.toLocaleString()} Kg dari Petani Mitra.`, "Harvest Inspector");
            addLog(`HARVEST_INSPECTOR: Mengukur tingkat kematangan buah (Brondolan) = ${ripeRatio}% dan kadar air.`, "Harvest Inspector");
            addLog(`HARVEST_INSPECTOR: Mengukur kadar Asam Lemak Bebas (FFA Level) = ${ffaLevel}%.`, "Harvest Inspector");
            
            setTimeout(() => {
              if (simulatePoorQuality || ripeRatio < 80 || ffaLevel > 5.0) {
                setInspectorStatus('failed');
                addLog("HARVEST_INSPECTOR: DITOLAK ✖! Kualitas TBS di bawah standar pabrik (FFA terlalu tinggi atau buah belum matang).", "Harvest Inspector");
                addLog("HARVEST_INSPECTOR: Status: TIDAK LAYAK PRODUKSI. Mengirim laporan penolakan ke koordinator.", "Harvest Inspector");
                currentStep = 99; // Jump to termination
              } else {
                setInspectorStatus('success');
                // Calculate rendemen estimate based on parameters
                const estRendemen = (21.0 + (ripeRatio - 80) * 0.08 - (ffaLevel - 2.0) * 0.2).toFixed(2);
                addLog(`HARVEST_INSPECTOR: PASSED ✅! Rendemen CPO terestimasi tinggi sebesar ${estRendemen}%.`, "Harvest Inspector");
                addLog("HARVEST_INSPECTOR: Status: LAYAK PRODUKSI. Meneruskan data batch ke agen kepatuhan PKS.", "Harvest Inspector");
                setHarvestYield(`LAYAK PRODUKSI (Est. Rendemen ${estRendemen}%)`);
                currentStep++;
              }
              setTimeout(runStep, 1000);
            }, 1200);
          }, 800);
          break;

        case 1:
          setAuditorStatus('active');
          addLog("PKS_AUDITOR: Menerima laporan panen layak produksi. Memulai audit kepatuhan pabrik & suplai kebun...", "PKS Auditor");
          addLog(`PKS_AUDITOR: Memverifikasi sertifikasi aktif ISPO / RSPO untuk Pabrik tujuan.`, "PKS Auditor");
          addLog(`PKS_AUDITOR: Memindai satelit radar geofencing pada koordinat kebun [${selectedComp.coords}].`, "PKS Auditor");
          
          setTimeout(() => {
            if (simulateDeforestation) {
              setAuditorStatus('failed');
              addLog("PKS_AUDITOR: WARNING ⚠️! Hasil pemindaian satelit mendeteksi pembukaan lahan (deforestasi) pasca-2020.", "PKS Auditor");
              addLog("PKS_AUDITOR: Pabrik terancam sanksi EUDR. Status: NON-COMPLIANT.", "PKS Auditor");
              currentStep = 99;
            } else {
              setAuditorStatus('success');
              addLog("PKS_AUDITOR: PASSED ✅! Lahan terbukti bebas deforestasi (Zero Deforestation) sejak 2020.", "PKS Auditor");
              addLog("PKS_AUDITOR: Status: PKS COMPLIANT (ISPO/RSPO Aktif & Lolos Regulasi EUDR).", "PKS Auditor");
              setMillCompliance("PKS COMPLIANT (EUDR Deforestation-Free)");
              currentStep++;
            }
            setTimeout(runStep, 1000);
          }, 1200);
          break;

        case 2:
          setProsperityStatus('active');
          addLog("FARMER_PROSPERITY: Menghitung parameter kesejahteraan ekonomi petani mitra...", "Farmer Prosperity");
          
          setTimeout(() => {
            // Calculate premium bonus
            const basePrice = 2450;
            const premiumPrice = basePrice + selectedComp.pricePremium;
            const totalNormalPayout = ffbWeight * basePrice;
            const totalPremiumPayout = ffbWeight * premiumPrice;
            const netPremiumBonus = totalPremiumPayout - totalNormalPayout;

            addLog(`FARMER_PROSPERITY: Harga Dasar: Rp ${basePrice}/kg | Harga Premium PODGE: Rp ${premiumPrice}/kg.`, "Farmer Prosperity");
            addLog(`FARMER_PROSPERITY: Tambahan Keuntungan Petani (Incentive Hijau): +Rp ${netPremiumBonus.toLocaleString()}.`, "Farmer Prosperity");
            addLog("FARMER_PROSPERITY: Memvalidasi kepemilikan rekening digital & kelayakan Green Sukuk untuk replanting...", "Farmer Prosperity");

            setTimeout(() => {
              setProsperityStatus('success');
              addLog("FARMER_PROSPERITY: Koperasi Tani Tervalidasi. Pengajuan kredit replanting bersubsidi disetujui.", "Farmer Prosperity");
              addLog("FARMER_PROSPERITY: Status: PETANI SEJAHTERA (Premium disalurkan & Dana Replanting aktif).", "Farmer Prosperity");
              setFarmerProsperity(`SEJAHTERA (+Rp ${netPremiumBonus.toLocaleString()} Premium Paid)`);
              currentStep++;
              setTimeout(runStep, 1000);
            }, 800);
          }, 800);
          break;

        case 3:
          setExportStatus('active');
          addLog("EXPORT_LOGISTICS: Mempersiapkan kargo CPO siap ekspor ke pasar global...", "Export Logistics");
          
          setTimeout(() => {
            const cpoVolumeTons = (ffbWeight * 0.22 / 1000).toFixed(2);
            addLog(`EXPORT_LOGISTICS: Menghasilkan sertifikat ekspor (EUDR Digital Cargo Passport).`, "Export Logistics");
            addLog(`EXPORT_LOGISTICS: Menghubungkan kargo volume CPO terproses sebesar ${cpoVolumeTons} Ton ke pembeli global di Rotterdam (EU).`, "Export Logistics");
            
            setTimeout(() => {
              setExportStatus('success');
              addLog("EXPORT_LOGISTICS: Bea Cukai & Karantina disetujui. Dokumen PEB / BC 3.0 aktif.", "Export Logistics");
              addLog("EXPORT_LOGISTICS: Status: EKSPOR CPO MELIMPAH & CLEARED. Pengapalan dijadwalkan.", "Export Logistics");
              
              setExportCargo(`CLEARED (${cpoVolumeTons} Ton CPO Terkirim Ke EU)`);
              currentStep++;
              setTimeout(runStep, 1000);
            }, 1000);
          }, 800);
          break;

        case 4:
          addLog("SYSTEM: Mengagregasikan hasil konsensus dari 4 Agen AI...", "System");
          
          setTimeout(() => {
            const mockHash = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 10);
            addLog(`SYSTEM: Blockchain Ledger Hash diterbitkan: ${mockHash}`, "System");
            addLog("SYSTEM: Pipeline selesai! Petani Sejahtera, PKS Comply, dan Ekspor CPO Lolos Audit. ✅", "System");
            
            setIsRunning(false);
            setPipelineFinished(true);
            setPipelineResult('pass');
          }, 1000);
          break;

        case 99: // Failure flow
          addLog("SYSTEM: Pipeline dihentikan secara prematur akibat kegagalan parameter audit ❌.", "System");
          setIsRunning(false);
          setPipelineFinished(true);
          setPipelineResult('fail');
          
          if (inspectorStatus === 'failed') {
            setHarvestYield("TIDAK LAYAK PRODUKSI (FFA/Matang Invalid)");
            setMillCompliance("ABORTED");
            setFarmerProsperity("ABORTED");
            setExportCargo("ABORTED");
          } else if (auditorStatus === 'failed') {
            setMillCompliance("NON-COMPLIANT (EUDR Deforestation Detected)");
            setFarmerProsperity("DISQUALIFIED");
            setExportCargo("BLOCKED");
          }
          break;
      }
    };

    runStep();
  };

  return (
    <div className="space-y-8 min-h-screen pb-16">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          Nemesis AI Core v2.1
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">AI Agent Operations Control Room</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Sistem koordinasi multi-agen sawit otonom: memastikan kelayakan mutu panen petani, kepatuhan legalitas PKS, 
          peningkatan kesejahteraan petani (Incentive Premium), dan kelancaran ekspor CPO melimpah ke pasar internasional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Network - 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Controls Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-950/70 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-950 pb-2">
              <Settings size={14} className="text-emerald-400" />
              Inference Configuration
            </h3>

            {/* Select Sample Case */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-emerald-400 uppercase">Pilih Perusahaan & Daerah</label>
              <select
                value={selectedComp.name}
                onChange={(e) => {
                  const comp = COMPANIES.find(c => c.name === e.target.value);
                  if (comp) setSelectedComp(comp);
                }}
                disabled={isRunning}
                className="w-full bg-black border border-emerald-950 text-white font-space text-xs rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
              >
                {COMPANIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.region})</option>
                ))}
              </select>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-3 pt-2">
              {/* Ripe ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-emerald-200/60">Buah Matang & Brondolan (Standard &gt;80%)</span>
                  <span className="text-white font-bold">{ripeRatio}%</span>
                </div>
                <input 
                  type="range" min="65" max="100" step="1" value={ripeRatio} 
                  onChange={(e) => setRipeRatio(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 cursor-pointer h-1 rounded bg-emerald-950"
                />
              </div>

              {/* FFA level */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-emerald-200/60">Kadar Asam Lemak Bebas / FFA (Standard &lt;5.0%)</span>
                  <span className="text-white font-bold">{ffaLevel}%</span>
                </div>
                <input 
                  type="range" min="1.5" max="7.0" step="0.1" value={ffaLevel} 
                  onChange={(e) => setFfaLevel(parseFloat(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 cursor-pointer h-1 rounded bg-emerald-950"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-emerald-200/60">Volume Setoran Panen</span>
                  <span className="text-white font-bold">{ffbWeight.toLocaleString()} Kg</span>
                </div>
                <input 
                  type="range" min="1000" max="15000" step="500" value={ffbWeight} 
                  onChange={(e) => setFfbWeight(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 cursor-pointer h-1 rounded bg-emerald-950"
                />
              </div>
            </div>

            {/* Simulated Failures */}
            <div className="space-y-3 pt-2 border-t border-emerald-950/70">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 block uppercase">EUDR Deforestation Viol</span>
                  <span className="text-[9px] text-emerald-200/40">Simulasikan PKS melanggar tebang hutan</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" checked={simulateDeforestation} 
                    onChange={(e) => {
                      setSimulateDeforestation(e.target.checked);
                      if (e.target.checked) setSimulatePoorQuality(false);
                    }}
                    disabled={isRunning}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-emerald-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-emerald-800 after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-black"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 block uppercase">Simulate Bad Harvest Quality</span>
                  <span className="text-[9px] text-emerald-200/40">Simulasikan TBS tidak layak buah busuk</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" checked={simulatePoorQuality} 
                    onChange={(e) => {
                      setSimulatePoorQuality(e.target.checked);
                      if (e.target.checked) setSimulateDeforestation(false);
                    }}
                    disabled={isRunning}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-emerald-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-emerald-800 after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-black"></div>
                </label>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleStartInference}
              disabled={isRunning}
              className={`w-full py-3 rounded-lg font-space font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                isRunning 
                  ? 'bg-emerald-950/40 text-emerald-500/50 border border-emerald-950' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.01]'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4" />
                  MENGANALISIS... (GEMINI PIPELINE ACTIVE)
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-black" />
                  MULAILAH ANALISIS MULTI-AGEN
                </>
              )}
            </button>
          </div>

          {/* AI Agent Network Map */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-950/70 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              AI Agent Network Map
            </h3>
            
            <div className="h-52 bg-black/45 rounded-xl border border-emerald-950 relative flex items-center justify-center p-4">
              
              {/* Center System Monitor node */}
              <div className="absolute z-10 p-2.5 rounded-full bg-black border border-emerald-800 flex items-center justify-center h-12 w-12 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Cpu size={20} className={isRunning ? 'animate-spin' : ''} />
              </div>

              {/* 1. Harvest Inspector (Top Left) */}
              <div className={`absolute top-4 left-4 z-10 p-2 rounded-lg border font-mono text-[8px] font-bold w-24 text-center transition-all ${
                inspectorStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                inspectorStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                inspectorStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400 font-bold' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <Activity className="h-3 w-3 mx-auto mb-1" />
                MUTU PANEN
                <span className="text-[6px] text-gray-500 block uppercase">{inspectorStatus}</span>
              </div>

              {/* 2. PKS Auditor (Top Right) */}
              <div className={`absolute top-4 right-4 z-10 p-2 rounded-lg border font-mono text-[8px] font-bold w-24 text-center transition-all ${
                auditorStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                auditorStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                auditorStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400 font-bold' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <ShieldCheck className="h-3 w-3 mx-auto mb-1" />
                KEPATUHAN PKS
                <span className="text-[6px] text-gray-500 block uppercase">{auditorStatus}</span>
              </div>

              {/* 3. Smallholder Prosperity (Bottom Left) */}
              <div className={`absolute bottom-4 left-4 z-10 p-2 rounded-lg border font-mono text-[8px] font-bold w-24 text-center transition-all ${
                prosperityStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                prosperityStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                prosperityStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400 font-bold' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <DollarSign className="h-3 w-3 mx-auto mb-1" />
                KESEJAHTERAAN
                <span className="text-[6px] text-gray-500 block uppercase">{prosperityStatus}</span>
              </div>

              {/* 4. Export Coordinator (Bottom Right) */}
              <div className={`absolute bottom-4 right-4 z-10 p-2 rounded-lg border font-mono text-[8px] font-bold w-24 text-center transition-all ${
                exportStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                exportStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                exportStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400 font-bold' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <Truck className="h-3 w-3 mx-auto mb-1" />
                EKSPOR CPO
                <span className="text-[6px] text-gray-500 block uppercase">{exportStatus}</span>
              </div>

              {/* SVG Connectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line x1="50%" y1="50%" x2="25%" y2="25%" stroke={inspectorStatus !== 'idle' ? '#10b981' : '#064e3b'} strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="75%" y2="25%" stroke={auditorStatus !== 'idle' ? '#10b981' : '#064e3b'} strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="25%" y2="75%" stroke={prosperityStatus !== 'idle' ? '#10b981' : '#064e3b'} strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="75%" y2="75%" stroke={exportStatus !== 'idle' ? '#10b981' : '#064e3b'} strokeWidth="1.5" />
              </svg>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Terminal Logs & Results - 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* The Console Window */}
          <div className="glass-panel rounded-2xl border border-emerald-500/20 overflow-hidden flex flex-col h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-emerald-950/90">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 animate-pulse"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 tracking-widest flex items-center gap-1.5">
                <Terminal size={12} />
                NEMESIS_ORCHESTRATOR_SAWIT_FLOW
              </span>
            </div>

            {/* Screen */}
            <div className="flex-1 bg-black p-4 font-mono text-[10px] text-gray-300 overflow-y-auto space-y-2 select-text scrollbar-thin">
              {logLines.length === 0 && (
                <div className="text-gray-500 h-full flex flex-col items-center justify-center space-y-2">
                  <Brain className="h-6 w-6 animate-pulse text-emerald-600" />
                  <span>Konsol Siap. Klik tombol di kiri untuk menganalisis mutu sawit, kesejahteraan, & ekspor.</span>
                </div>
              )}
              {logLines.map((line, idx) => {
                let colorClass = 'text-gray-300';
                if (line.includes('[SYSTEM]')) colorClass = 'text-gray-400 font-bold';
                if (line.includes('[HARVEST INSPECTOR]')) colorClass = 'text-yellow-400';
                if (line.includes('[PKS AUDITOR]')) colorClass = 'text-cyan-400';
                if (line.includes('[FARMER PROSPERITY]')) colorClass = 'text-purple-400';
                if (line.includes('[EXPORT LOGISTICS]')) colorClass = 'text-emerald-400';
                if (line.includes('WARNING') || line.includes('DITOLAK') || line.includes('BLOCKED')) colorClass = 'text-red-400 font-bold';
                if (line.includes('PASSED') || line.includes('LAYAK') || line.includes('SEJAHTERA') || line.includes('MELIMPAH')) colorClass = 'text-green-400 font-bold';

                return (
                  <div key={idx} className={`${colorClass} leading-relaxed break-all`}>
                    {line}
                  </div>
                );
              })}
              {isRunning && (
                <div className="text-emerald-400 flex items-center gap-1">
                  <span>🤖 Agen {activeAgentName} sedang memproses data...</span>
                  <span className="animate-ping text-[12px] font-bold">.</span>
                </div>
              )}
              <div ref={consoleEndRef}></div>
            </div>
          </div>

          {/* Consolidated Inference Outputs */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-950/70 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              Consolidated Audit Reports
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Outputs Summary */}
              <div className="bg-black/35 border border-emerald-950 rounded-xl p-4 space-y-3">
                <div className="flex justify-between border-b border-emerald-950/60 pb-1.5 text-xs">
                  <span className="text-emerald-200/50">Mutu TBS Petani:</span>
                  <span className={`font-bold ${harvestYield.includes('TIDAK') ? 'text-red-400' : 'text-white'}`}>{harvestYield}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1.5 text-xs">
                  <span className="text-emerald-200/50">Audit Kepatuhan PKS:</span>
                  <span className={`font-bold ${millCompliance.includes('NON') ? 'text-red-400' : 'text-white'}`}>{millCompliance}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1.5 text-xs">
                  <span className="text-emerald-200/50">Kesejahteraan Petani:</span>
                  <span className={`font-bold ${farmerProsperity.includes('DISQ') ? 'text-red-400' : 'text-white'}`}>{farmerProsperity}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-200/50">Logistik & Ekspor CPO:</span>
                  <span className="font-bold text-white">{exportCargo}</span>
                </div>
              </div>

              {/* Status Flag */}
              <div className="flex flex-col items-center justify-center bg-black/45 border border-emerald-950 rounded-xl p-4 text-center">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-2 font-bold">Consensus Signature</span>
                
                {!pipelineFinished ? (
                  <div className="text-gray-500 flex flex-col items-center gap-1.5">
                    <Activity className="h-8 w-8 animate-pulse text-emerald-900" />
                    <span className="text-xs">Menunggu Eksekusi Simulasi</span>
                  </div>
                ) : pipelineResult === 'pass' ? (
                  <div className="space-y-1">
                    <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto" />
                    <span className="text-sm font-extrabold text-white font-space uppercase block">BATCH APPROVED</span>
                    <span className="text-[9px] text-green-500/80 font-mono block">CPO Lolos Audit Ekspor Melimpah</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <XCircle className="h-10 w-10 text-red-400 mx-auto" />
                    <span className="text-sm font-extrabold text-red-400 font-space uppercase block">BATCH BLOCKED</span>
                    <span className="text-[9px] text-red-500/80 font-mono block">Gagal Standar Kepatuhan Sawit</span>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
