'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Brain, Cpu, Terminal, ShieldAlert, CheckCircle2, XCircle, 
  Eye, Activity, FileText, RefreshCw, Play, ArrowRight, 
  Server, Settings, AlertCircle, MapPin, Sparkles, Coins
} from 'lucide-react';

type AgentStatus = 'idle' | 'active' | 'success' | 'failed';

const COMPANIES = [
  { name: 'PT Borneo Palm Energy', region: 'Kalimantan Tengah', coords: '-2.215, 113.921', age: 14, fertilizer: 110 },
  { name: 'PT Riau Agromakmur', region: 'Riau', coords: '0.534, 101.442', age: 10, fertilizer: 95 },
  { name: 'PT Sumatera Palm Lestari', region: 'Sumatera Utara', coords: '3.595, 98.672', age: 18, fertilizer: 120 }
];

export default function AIAgentsPage() {
  const [selectedComp, setSelectedComp] = useState(COMPANIES[0]);
  const [simulateDeforestation, setSimulateDeforestation] = useState(false);
  const [fertilizerLevel, setFertilizerLevel] = useState(100);
  const [treeAge, setTreeAge] = useState(12);

  // Agent states
  const [coordinatorStatus, setCoordinatorStatus] = useState<AgentStatus>('idle');
  const [auditorStatus, setAuditorStatus] = useState<AgentStatus>('idle');
  const [forecasterStatus, setForecasterStatus] = useState<AgentStatus>('idle');
  const [evaluatorStatus, setEvaluatorStatus] = useState<AgentStatus>('idle');

  const [isRunning, setIsRunning] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [activeAgentName, setActiveAgentName] = useState<string>('System');
  
  // Results panel states
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<'pass' | 'fail' | null>(null);
  const [yieldResult, setYieldResult] = useState<string>('-');
  const [esgRatingResult, setEsgRatingResult] = useState<string>('-');
  const [sukukResult, setSukukResult] = useState<string>('-');

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
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

    // Reset states
    setIsRunning(true);
    setPipelineFinished(false);
    setPipelineResult(null);
    setLogLines([]);
    setYieldResult('-');
    setEsgRatingResult('-');
    setSukukResult('-');

    setCoordinatorStatus('active');
    setAuditorStatus('idle');
    setForecasterStatus('idle');
    setEvaluatorStatus('idle');

    let currentStep = 0;
    const runStep = () => {
      switch (currentStep) {
        case 0:
          addLog("SYSTEM: Initializing Podge-Nemesis AI Agentic Hub v2.0...", "System");
          addLog("SYSTEM: Core LLM engine loaded successfully (Gemini-1.5-Pro).", "System");
          setTimeout(() => {
            addLog(`COORDINATOR: Received new batch ingestion request from ${selectedComp.name} (${selectedComp.region}).`, "Coordinator");
            addLog("COORDINATOR: Validating input metadata and setting up pipeline tokens...", "Coordinator");
            currentStep++;
            setTimeout(runStep, 800);
          }, 600);
          break;

        case 1:
          addLog("COORDINATOR: Delegating geo-spatial verification to Satellite Auditor Agent.", "Coordinator");
          setCoordinatorStatus('success');
          setAuditorStatus('active');
          setTimeout(() => {
            addLog(`SATELLITE_AUDITOR: Querying Sentinel-2 & Landsat-9 imagery feed for coordinates: [${selectedComp.coords}].`, "Satellite Auditor");
            addLog("SATELLITE_AUDITOR: Downloading band telemetry (NDVI, NDWI, Soil Moisture)...", "Satellite Auditor");
            
            setTimeout(() => {
              if (simulateDeforestation) {
                setAuditorStatus('failed');
                addLog("SATELLITE_AUDITOR: WARNING ⚠️! Canopy clearing detected in conservation zone (post-2020).", "Satellite Auditor");
                addLog("SATELLITE_AUDITOR: Non-compliant with EUDR (EU Deforestation Regulation) Article 3.", "Satellite Auditor");
                addLog("SATELLITE_AUDITOR: Status: NON-COMPLIANT. Dispatched warning report to Coordinator.", "Satellite Auditor");
                currentStep = 99; // Jump to failure termination
              } else {
                setAuditorStatus('success');
                addLog("SATELLITE_AUDITOR: PASS ✅! No forest canopy clearing detected since 31 December 2020 cutoff date.", "Satellite Auditor");
                addLog("SATELLITE_AUDITOR: Peatland buffer zone intact. Geofenced boundaries verified.", "Satellite Auditor");
                addLog("SATELLITE_AUDITOR: Status: COMPLIANT. Sent verification certificate to Coordinator.", "Satellite Auditor");
                currentStep++;
              }
              setTimeout(runStep, 1000);
            }, 1200);
          }, 800);
          break;

        case 2:
          setCoordinatorStatus('active');
          addLog("COORDINATOR: Auditor report received: COMPLIANT.", "Coordinator");
          addLog("COORDINATOR: Delegating agronomic forecasting to Yield Forecaster Agent.", "Coordinator");
          
          setTimeout(() => {
            setCoordinatorStatus('success');
            setForecasterStatus('active');
            addLog(`YIELD_FORECASTER: Ingesting variables: Average Tree Age = ${treeAge} years, Fertilizer dosage = ${fertilizerLevel}%.`, "Yield Forecaster");
            addLog("YIELD_FORECASTER: Running Random Forest predictive regressor model on regional soil moisture...", "Yield Forecaster");
            
            setTimeout(() => {
              // Formula for mock yield forecast
              const baseVal = 17.2;
              const fertFactor = (fertilizerLevel / 100) * 2.8;
              const ageFactor = treeAge < 7 ? (treeAge / 7) * 10 : treeAge <= 17 ? 16 : 16 - (treeAge - 17) * 0.6;
              const computedYield = (baseVal + fertFactor + (ageFactor - 12)).toFixed(1);
              const computedRendemen = (20 + (fertilizerLevel / 100) * 1.5 + (treeAge < 15 ? 1.5 : 0.5)).toFixed(1);

              setForecasterStatus('success');
              addLog(`YIELD_FORECASTER: Forecast finalized. Projected Annual Yield = ${computedYield} Ton/Ha/Year.`, "Yield Forecaster");
              addLog(`YIELD_FORECASTER: Projected CPO Extraction Rate (Rendemen) = ${computedRendemen}%.`, "Yield Forecaster");
              addLog("YIELD_FORECASTER: Sent agronomic forecast output report to Coordinator.", "Yield Forecaster");
              
              setYieldResult(`${computedYield} T/Ha/Yr (${computedRendemen}% Rendemen)`);
              currentStep++;
              setTimeout(runStep, 1000);
            }, 1200);
          }, 800);
          break;

        case 3:
          setCoordinatorStatus('active');
          addLog("COORDINATOR: Yield Forecaster report received.", "Coordinator");
          addLog("COORDINATOR: Delegating Shariah compliance & risk audit to Risk Evaluator Agent.", "Coordinator");
          
          setTimeout(() => {
            setCoordinatorStatus('success');
            setEvaluatorStatus('active');
            addLog("RISK_EVALUATOR: Auditing farmer registration data, cooperative credentials, & STDB status...", "Risk Evaluator");
            addLog("RISK_EVALUATOR: Calculating Green Sukuk replanting credit score...", "Risk Evaluator");
            
            setTimeout(() => {
              setEvaluatorStatus('success');
              addLog("RISK_EVALUATOR: ESG Compliance Rating: A (High Compliance).", "Risk Evaluator");
              addLog("RISK_EVALUATOR: Green Sukuk Eligibility: qualified (Score 94/100).", "Risk Evaluator");
              addLog("RISK_EVALUATOR: Applied profit-share Nisbah discount: -0.5% p.a. (Green Premium incentive).", "Risk Evaluator");
              addLog("RISK_EVALUATOR: Sent final risk clearance approval to Coordinator.", "Risk Evaluator");
              
              setEsgRatingResult('A (Excellent)');
              setSukukResult('ELIGIBLE (Nisbah: 7.7% p.a.)');
              currentStep++;
              setTimeout(runStep, 1000);
            }, 1200);
          }, 800);
          break;

        case 4:
          setCoordinatorStatus('active');
          addLog("COORDINATOR: All reports aggregated. Compiling final digital passport ledger payload...", "Coordinator");
          
          setTimeout(() => {
            const mockHash = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 10);
            addLog(`COORDINATOR: Cryptographic State Hash generated: ${mockHash}`, "Coordinator");
            addLog("COORDINATOR: Committing transaction proof to ledger node... Success.", "Coordinator");
            addLog("SYSTEM: Pipeline execution completed successfully. Batch marked as VERIFIED. ✅", "System");
            
            setCoordinatorStatus('success');
            setIsRunning(false);
            setPipelineFinished(true);
            setPipelineResult('pass');
          }, 1000);
          break;

        case 99: // Failure flow
          setCoordinatorStatus('active');
          addLog("COORDINATOR: CRITICAL - Satellite Auditor reports NON-COMPLIANT status. Aborting analytical loop.", "Coordinator");
          
          setTimeout(() => {
            setCoordinatorStatus('failed');
            setEvaluatorStatus('active');
            addLog("RISK_EVALUATOR: Flagging batch as High-Risk. Disqualifying from all green financing registers.", "Risk Evaluator");
            addLog("RISK_EVALUATOR: ESG Rating: F (Non-Compliant due to deforestation violation).", "Risk Evaluator");
            
            setTimeout(() => {
              setEvaluatorStatus('failed');
              setCoordinatorStatus('failed');
              addLog("COORDINATOR: Ingestion pipeline aborted ❌.", "Coordinator");
              addLog("SYSTEM: Pipeline terminated with errors. Batch marked as REJECTED / INVALID. ✖", "System");
              
              setEsgRatingResult('F (Non-Compliant)');
              setSukukResult('DISQUALIFIED');
              setIsRunning(false);
              setPipelineFinished(true);
              setPipelineResult('fail');
            }, 800);
          }, 800);
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
          Nemesis AI Core
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">AI Agent Operations Control Room</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Pusat koordinasi otonom multi-agen untuk verifikasi kepatuhan EUDR, perhitungan karbon, 
          dan kelayakan kredit hijau kelapa sawit secara terintegrasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (Settings & Status Map) - 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Settings Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-950/70 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-950 pb-2">
              <Settings size={14} className="text-emerald-400" />
              Inference Configuration
            </h3>

            {/* Select Sample Case */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-emerald-400 uppercase">Pilih Entitas Perusahaan</label>
              <select
                value={selectedComp.name}
                onChange={(e) => {
                  const comp = COMPANIES.find(c => c.name === e.target.value);
                  if (comp) {
                    setSelectedComp(comp);
                    setFertilizerLevel(comp.fertilizer);
                    setTreeAge(comp.age);
                  }
                }}
                disabled={isRunning}
                className="w-full bg-black border border-emerald-950 text-white font-space text-xs rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
              >
                {COMPANIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.region})</option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-2">
              {/* Tree Age */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-emerald-200/60">Umur Tanaman Sawit</span>
                  <span className="text-white font-bold">{treeAge} Tahun</span>
                </div>
                <input 
                  type="range" min="3" max="25" step="1" value={treeAge} 
                  onChange={(e) => setTreeAge(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 cursor-pointer h-1 rounded bg-emerald-950"
                />
              </div>

              {/* Fertilizer */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-emerald-200/60">Dosis Pemupukan</span>
                  <span className="text-white font-bold">{fertilizerLevel}%</span>
                </div>
                <input 
                  type="range" min="50" max="150" step="5" value={fertilizerLevel} 
                  onChange={(e) => setFertilizerLevel(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 cursor-pointer h-1 rounded bg-emerald-950"
                />
              </div>
            </div>

            {/* Toggle Deforestation Violation */}
            <div className="flex items-center justify-between border-t border-emerald-950/70 pt-4">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 block uppercase">EUDR Deforestation Test</span>
                <span className="text-[9px] text-emerald-200/40">Simulasikan pelanggaran tebang hutan</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" checked={simulateDeforestation} 
                  onChange={(e) => setSimulateDeforestation(e.target.checked)}
                  disabled={isRunning}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-emerald-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-emerald-800 after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-black"></div>
              </label>
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
                  PROCESSING MULTI-AGENT INFERENCE...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-black" />
                  TRIGGER MULTI-AGENT INFERENCE
                </>
              )}
            </button>
          </div>

          {/* Graphical Agentic Node Network Map */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-950/70 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              AI Agent Network Map
            </h3>
            
            <div className="h-48 bg-black/45 rounded-xl border border-emerald-950 relative flex items-center justify-center p-4">
              
              {/* Coordinator Center Node */}
              <div className={`absolute z-10 p-3 rounded-xl border font-mono text-[9px] font-bold transition-all flex flex-col items-center justify-center w-28 text-center ${
                coordinatorStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                coordinatorStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                coordinatorStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <Cpu className={`h-4 w-4 mb-1 ${coordinatorStatus === 'active' ? 'animate-pulse' : ''}`} />
                COORDINATOR
                <span className="text-[7px] text-gray-500 block uppercase mt-0.5">{coordinatorStatus}</span>
              </div>

              {/* Satellite Auditor (Top Left) */}
              <div className={`absolute top-4 left-4 z-10 p-2 rounded-lg border font-mono text-[8px] font-bold w-24 text-center transition-all ${
                auditorStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                auditorStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                auditorStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <Eye className="h-3 w-3 mx-auto mb-1" />
                SAT_AUDITOR
              </div>

              {/* Yield Forecaster (Top Right) */}
              <div className={`absolute top-4 right-4 z-10 p-2 rounded-lg border font-mono text-[8px] font-bold w-24 text-center transition-all ${
                forecasterStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                forecasterStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                forecasterStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <Activity className="h-3 w-3 mx-auto mb-1" />
                YIELD_FORECASTER
              </div>

              {/* Risk Evaluator (Bottom Center) */}
              <div className={`absolute bottom-4 z-10 p-2 rounded-lg border font-mono text-[8px] font-bold w-24 text-center transition-all ${
                evaluatorStatus === 'active' ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                evaluatorStatus === 'success' ? 'bg-black/50 border-emerald-500 text-emerald-400' :
                evaluatorStatus === 'failed' ? 'bg-red-950/50 border-red-500 text-red-400' :
                'bg-black/40 border-emerald-950 text-gray-500'
              }`}>
                <Server className="h-3 w-3 mx-auto mb-1" />
                RISK_EVALUATOR
              </div>

              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                {/* Coordinator to Auditor */}
                <line x1="50%" y1="50%" x2="25%" y2="25%" stroke={auditorStatus !== 'idle' ? '#10b981' : '#064e3b'} strokeWidth="1.5" strokeDasharray={auditorStatus === 'active' ? '4 4' : ''} />
                {/* Coordinator to Forecaster */}
                <line x1="50%" y1="50%" x2="75%" y2="25%" stroke={forecasterStatus !== 'idle' ? '#10b981' : '#064e3b'} strokeWidth="1.5" strokeDasharray={forecasterStatus === 'active' ? '4 4' : ''} />
                {/* Coordinator to Risk Evaluator */}
                <line x1="50%" y1="50%" x2="50%" y2="75%" stroke={evaluatorStatus !== 'idle' ? '#10b981' : '#064e3b'} strokeWidth="1.5" strokeDasharray={evaluatorStatus === 'active' ? '4 4' : ''} />
              </svg>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Live Console & Inference Results) - 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Live Execution Console */}
          <div className="glass-panel rounded-2xl border border-emerald-500/20 overflow-hidden flex flex-col h-[380px]">
            {/* Header of terminal */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-emerald-950/90">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80 tracking-widest flex items-center gap-1.5">
                <Terminal size={12} />
                NEMESIS_ORCHESTRATOR_LOGS
              </span>
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 bg-black p-4 font-mono text-[10px] text-gray-300 overflow-y-auto space-y-2 select-text scrollbar-thin">
              {logLines.length === 0 && (
                <div className="text-gray-500 h-full flex items-center justify-center flex-col space-y-2">
                  <Cpu className="h-6 w-6 animate-pulse" />
                  <span>Terminal ready. Click "TRIGGER MULTI-AGENT INFERENCE" to start.</span>
                </div>
              )}
              {logLines.map((line, idx) => {
                let colorClass = 'text-gray-300';
                if (line.includes('[SYSTEM]')) colorClass = 'text-gray-400 font-bold';
                if (line.includes('[COORDINATOR]')) colorClass = 'text-emerald-400';
                if (line.includes('[SATELLITE AUDITOR]')) colorClass = 'text-cyan-400';
                if (line.includes('[YIELD FORECASTER]')) colorClass = 'text-yellow-400';
                if (line.includes('[RISK EVALUATOR]')) colorClass = 'text-purple-400';
                if (line.includes('WARNING') || line.includes('REJECTED')) colorClass = 'text-red-400 font-bold';
                if (line.includes('PASS') || line.includes('VERIFIED')) colorClass = 'text-green-400 font-bold';

                return (
                  <div key={idx} className={`${colorClass} leading-relaxed break-all`}>
                    {line}
                  </div>
                );
              })}
              {isRunning && (
                <div className="text-emerald-400 flex items-center gap-1">
                  <span>🤖 Agent {activeAgentName} is processing...</span>
                  <span className="animate-ping text-[12px] font-bold">.</span>
                </div>
              )}
              <div ref={consoleEndRef}></div>
            </div>
          </div>

          {/* Consolidated Pipeline Results Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-950/70 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              Consolidated Inference Output
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left results card */}
              <div className="bg-black/35 border border-emerald-950 rounded-xl p-4 space-y-3">
                <div className="flex justify-between border-b border-emerald-950/60 pb-1.5 text-xs">
                  <span className="text-emerald-200/50">Agronomic Yield (Forecaster):</span>
                  <span className="font-bold text-white text-right">{yieldResult}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-950/60 pb-1.5 text-xs">
                  <span className="text-emerald-200/50">ESG Compliance Score (Evaluator):</span>
                  <span className="font-bold text-white text-right">{esgRatingResult}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-200/50">Green Sukuk Status:</span>
                  <span className="font-bold text-white text-right">{sukukResult}</span>
                </div>
              </div>

              {/* Right status card */}
              <div className="flex flex-col items-center justify-center bg-black/45 border border-emerald-950 rounded-xl p-4 text-center">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-2">Final Consensus Status</span>
                
                {!pipelineFinished ? (
                  <div className="text-gray-500 flex flex-col items-center gap-1.5">
                    <Activity className="h-8 w-8 animate-pulse text-emerald-800" />
                    <span className="text-xs">Awaiting Agent Run</span>
                  </div>
                ) : pipelineResult === 'pass' ? (
                  <div className="space-y-1">
                    <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto" />
                    <span className="text-sm font-extrabold text-white font-space uppercase block">BATCH VERIFIED</span>
                    <span className="text-[9px] text-green-500/80 font-mono block">COMMITTED TO BLOCKCHAIN</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <XCircle className="h-10 w-10 text-red-400 mx-auto" />
                    <span className="text-sm font-extrabold text-red-400 font-space uppercase block">BATCH REJECTED</span>
                    <span className="text-[9px] text-red-500/80 font-mono block">EUDR COMPLIANCE FAILURE</span>
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
