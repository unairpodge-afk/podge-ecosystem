'use client';

import { useState } from 'react';
import { 
  Brain, Cpu, Activity, FileText, Layers, Eye, MapPin, Key, 
  TrendingUp, Award, Sparkles, Users, Building, Code, Terminal, 
  Sprout, Wind, DollarSign, Wallet, Globe, Database, Play, Coins, 
  RefreshCw, CheckCircle2, Leaf, BarChart3, Shield, Info, ArrowRight,
  ShieldCheck, AlertTriangle
} from 'lucide-react';

// List of layers and their corresponding nodes based on the image
const LAYERS = [
  {
    id: 'data',
    name: 'DATA LAYER',
    color: 'emerald',
    bgColor: 'bg-emerald-950/20',
    borderColor: 'border-emerald-500/20',
    accentColor: 'text-emerald-400',
    glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    items: [
      { id: 'produksi', name: 'PRODUKSI', desc: 'Produksi TBS, produktivitas, rendemen, & kualitas.', icon: Sprout },
      { id: 'esg', name: 'ESG', desc: 'Kepatuhan ISPO/RSPO, sosial, & indikator keberlanjutan.', icon: ShieldCheck },
      { id: 'emisi', name: 'EMISI', desc: 'Scope 1,2,3 karbon, serapan, & energi terbarukan.', icon: Wind },
      { id: 'keuangan', name: 'KEUANGAN', desc: 'OPEX, pendapatan, arus kas, & profitabilitas.', icon: Wallet },
      { id: 'pasar', name: 'PASAR', desc: 'Harga komoditas, permintaan, & regulasi global (EUDR).', icon: Globe }
    ]
  },
  {
    id: 'analytics',
    name: 'ANALYTICS LAYER',
    color: 'blue',
    bgColor: 'bg-blue-950/20',
    borderColor: 'border-blue-500/20',
    accentColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    items: [
      { id: 'forecasting', name: 'AI FORECASTING', desc: 'Prediksi produksi, harga, cuaca, & yield kebun.', icon: Brain },
      { id: 'carbon_accounting', name: 'CARBON ACCOUNTING', desc: 'Jejak karbon, net emisi, & potensi carbon offset.', icon: Activity },
      { id: 'esg_analytics', name: 'ESG ANALYTICS', desc: 'Skoring ESG, benchmarking, & rekomendasi perbaikan.', icon: BarChart3 },
      { id: 'risk_analytics', name: 'RISK ANALYTICS', desc: 'Analisis risiko iklim, operasional, pasar, & regulasi.', icon: AlertTriangle }
    ]
  },
  {
    id: 'governance',
    name: 'GOVERNANCE LAYER',
    color: 'purple',
    bgColor: 'bg-purple-950/20',
    borderColor: 'border-purple-500/20',
    accentColor: 'text-purple-400',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]',
    items: [
      { id: 'reporting', name: 'DIGITAL REPORTING', desc: 'Pelaporan digital real-time & integrasi data multi-pihak.', icon: FileText },
      { id: 'traceability', name: 'BLOCKCHAIN TRACEABILITY', desc: 'Ketertelusuran TBS-CPO, data transparan, & QR passport.', icon: Layers },
      { id: 'compliance', name: 'COMPLIANCE MONITORING', desc: 'Monitoring ISPO/RSPO, regulasi, & deteksi dini.', icon: Eye },
      { id: 'smart_contract', name: 'SMART CONTRACT', desc: 'Otomatisasi kontrak dagang & pembayaran petani.', icon: Key }
    ]
  },
  {
    id: 'value_creation',
    name: 'VALUE CREATION LAYER',
    color: 'orange',
    bgColor: 'bg-orange-950/20',
    borderColor: 'border-orange-500/20',
    accentColor: 'text-orange-400',
    glowColor: 'shadow-[0_0_15px_rgba(249,115,22,0.1)]',
    items: [
      { id: 'green_financing', name: 'GREEN FINANCING', desc: 'Penilaian kelayakan hijau, kredit, & scoring bank.', icon: DollarSign },
      { id: 'carbon_market', name: 'CARBON MARKET', desc: 'Registrasi, sertifikasi, & perdagangan kredit karbon.', icon: Coins },
      { id: 'green_sukuk', name: 'GREEN SUKUK', desc: 'Obligasi syariah hijau untuk pendanaan replanting.', icon: TrendingUp },
      { id: 'premium_access', name: 'PREMIUM MARKET ACCESS', desc: 'Akses pasar global bernilai tinggi & kepatuhan ekspor.', icon: Award }
    ]
  },
  {
    id: 'impact',
    name: 'IMPACT LAYER',
    color: 'cyan',
    bgColor: 'bg-cyan-950/20',
    borderColor: 'border-cyan-500/20',
    accentColor: 'text-cyan-400',
    glowColor: 'shadow-[0_0_15px_rgba(6,182,212,0.1)]',
    items: [
      { id: 'econ_impact', name: 'ECONOMIC IMPACT', desc: 'Peningkatan produktivitas, efisiensi biaya, & pendapatan.', icon: Sparkles },
      { id: 'social_impact', name: 'SOCIAL IMPACT', desc: 'Kesejahteraan petani, lapangan kerja, & inklusi sosial.', icon: Users },
      { id: 'env_impact', name: 'ENVIRONMENTAL IMPACT', desc: 'Penurunan emisi GRK & konservasi keanekaragaman hayati.', icon: Leaf }
    ]
  }
];

const STAKEHOLDERS = [
  'PETANI', 'KOPERASI', 'PKS / PERUSAHAAN', 'LEMBAGA KEUANGAN', 'PEMERINTAH / REGULATOR', 'INVESTOR', 'BUYER / PASAR GLOBAL'
];

const TECHNOLOGIES = [
  { name: 'IoT & Sensor', icon: Database },
  { name: 'Cloud Computing', icon: Globe },
  { name: 'Big Data', icon: Layers },
  { name: 'AI / Machine Learning', icon: Brain },
  { name: 'Blockchain', icon: Cpu },
  { name: 'GIS & Remote Sensing', icon: MapPin },
  { name: 'Mobile App', icon: FileText },
  { name: 'API Integration', icon: Code },
  { name: 'Cyber Security', icon: Shield }
];

export default function PodgeBlueprint() {
  const [selectedNode, setSelectedNode] = useState('traceability');
  
  // Custom states for simulations
  const [aiRainfall, setAiRainfall] = useState(2500);
  const [aiFertilizer, setAiFertilizer] = useState(100);
  const [aiTreeAge, setAiTreeAge] = useState(12);
  const [carbonTbs, setCarbonTbs] = useState(15000);
  const [carbonBiogas, setCarbonBiogas] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('Borneo');
  const [miningStatus, setMiningStatus] = useState<'idle' | 'mining' | 'success'>('idle');
  const [blockchainLogs, setBlockchainLogs] = useState([
    { block: '#89283', hash: '0x4f3e...1a9d', from: 'KUD Borneo Manunggal', to: 'PT Borneo Palm Energy Mill', status: 'VERIFIED' },
    { block: '#89282', hash: '0x7b1c...9f2e', from: 'Koperasi Riau Makmur', to: 'PT Riau Agromakmur Mill', status: 'VERIFIED' },
    { block: '#89281', hash: '0x3d9a...6c8b', from: 'Gapoktan Sumut Jaya', to: 'PT Sumatera Palm Lestari Mill', status: 'VERIFIED' }
  ]);
  const [contractWeight, setContractWeight] = useState(4500);
  const [contractPrice, setContractPrice] = useState(2850);
  const [contractOutput, setContractOutput] = useState<string[]>([]);
  const [contractRunning, setContractRunning] = useState(false);

  // AI Forecasting Calculation
  const calculateForecastYield = () => {
    // Math formula simulating crop yield based on parameters
    const baseYield = 16.5; 
    const rainfallDiff = Math.abs(aiRainfall - 2400);
    const rainfallFactor = Math.max(-4, 2 - (rainfallDiff * 0.003));
    const fertilizerFactor = (aiFertilizer / 100) * 3.5;
    
    let ageFactor = 0;
    if (aiTreeAge < 6) ageFactor = (aiTreeAge / 6) * 12;
    else if (aiTreeAge <= 16) ageFactor = 16 + (aiTreeAge - 6) * 0.5;
    else ageFactor = 21 - (aiTreeAge - 16) * 0.7;

    return Math.max(5, Math.min(28, baseYield + rainfallFactor + fertilizerFactor + (ageFactor - 12))).toFixed(1);
  };

  // Carbon Accounting Calculations
  const calcCarbonScope1 = () => Math.round(carbonTbs * 0.045);
  const calcCarbonScope2 = () => Math.round(carbonTbs * 0.012);
  const calcCarbonScope3 = () => Math.round(carbonTbs * 0.165);
  const calcCarbonBiogasReduction = () => carbonBiogas ? Math.round(carbonTbs * 0.098) : 0;
  const calcCarbonNet = () => calcCarbonScope1() + calcCarbonScope2() + calcCarbonScope3() - calcCarbonBiogasReduction();
  const calcCarbonOffsetUSD = () => Math.round(calcCarbonBiogasReduction() * 12.5);

  // Mine a new block
  const handleMineBlock = () => {
    setMiningStatus('mining');
    setTimeout(() => {
      const newBlock = {
        block: `#89${Math.floor(Math.random() * 900) + 100}`,
        hash: '0x' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6),
        from: selectedCompany === 'Borneo' ? 'KUD Borneo Manunggal' : selectedCompany === 'Riau' ? 'Koperasi Riau Makmur' : 'Gapoktan Sumut Jaya',
        to: selectedCompany === 'Borneo' ? 'PT Borneo Palm Energy Mill' : selectedCompany === 'Riau' ? 'PT Riau Agromakmur Mill' : 'PT Sumatera Palm Lestari Mill',
        status: 'VERIFIED'
      };
      setBlockchainLogs([newBlock, ...blockchainLogs]);
      setMiningStatus('success');
      setTimeout(() => setMiningStatus('idle'), 2000);
    }, 1200);
  };

  // Run Smart Contract Payout Simulation
  const handleRunSmartContract = () => {
    setContractRunning(true);
    setContractOutput([]);
    
    const steps = [
      `[0.0s] Querying oracle for Batch-ID verification...`,
      `[0.4s] Geofencing status: PASS (Source land verified forest-free)`,
      `[0.8s] Quality verified: FFB Weight = ${contractWeight.toLocaleString()} kg | Price = Rp ${contractPrice}/kg`,
      `[1.2s] Calculating net payout: Rp ${(contractWeight * contractPrice).toLocaleString()}`,
      `[1.6s] Triggering ESCROW smart contract 0x5a9d...4f8c`,
      `[2.0s] Signatures validated: Cooperative (OK) & PKS Mill (OK)`,
      `[2.4s] Blockchain consensus achieved. Payment broadcasted to farmer bank node.`,
      `[2.8s] TX HASH: 0x${Math.random().toString(16).slice(2, 12)}c3b4e... SUCCESS ✅`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setContractOutput(prev => [...prev, step]);
        if (idx === steps.length - 1) setContractRunning(false);
      }, idx * 400);
    });
  };

  return (
    <section className="relative z-10 border-t border-emerald-900/30 bg-[#06110b]/80 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Headline */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
            <Leaf size={14} className="animate-pulse" />
            <span>Interactive Architecture Blueprint</span>
          </div>
          <h2 className="font-space text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            PODGE 2.0 Ecosystem
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-emerald-200/60 sm:text-base">
            Ekosistem sawit digital berkelanjutan yang menghubungkan data lapangan, audit blockchain, 
            analisis emisi karbon, hingga pembiayaan hijau (Green Sukuk) untuk pasar global.
          </p>
        </div>

        {/* Grid Layout: Blueprint on Left, Control Console on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: The 5-Layer Stacked Diagram */}
          <div className="lg:col-span-8 space-y-4">
            {LAYERS.map((layer) => (
              <div 
                key={layer.id} 
                className={`p-4 rounded-xl border ${layer.borderColor} ${layer.bgColor} transition-all relative overflow-hidden`}
              >
                {/* Decorative layer glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl pointer-events-none"></div>
                
                {/* Layer Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-bold tracking-widest ${layer.accentColor}`}>
                    {layer.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Status: Active</span>
                </div>

                {/* Nodes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {layer.items.map((node) => {
                    const NodeIcon = node.icon;
                    const isSelected = selectedNode === node.id;
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className={`flex flex-col items-center justify-between p-3 rounded-lg border text-center transition-all min-h-[90px] relative group cursor-pointer ${
                          isSelected 
                            ? `bg-black/60 border-emerald-500 ${layer.glowColor} scale-[1.02] z-10` 
                            : 'bg-black/35 border-emerald-950/50 hover:border-emerald-700/60 hover:bg-black/45'
                        }`}
                      >
                        <NodeIcon className={`h-5 w-5 mb-2 transition-transform group-hover:scale-110 ${
                          isSelected ? 'text-emerald-400' : 'text-gray-400'
                        }`} />
                        <span className={`text-[10px] font-bold font-space tracking-wide uppercase leading-tight ${
                          isSelected ? 'text-white' : 'text-emerald-100/65 group-hover:text-emerald-300'
                        }`}>
                          {node.name}
                        </span>
                        
                        {/* Selector indicator */}
                        {isSelected && (
                          <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Multi-Stakeholder Ecosystem layer */}
            <div className="p-4 rounded-xl border border-emerald-950/60 bg-emerald-950/5 relative">
              <div className="text-center mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-400/80 uppercase">
                  MULTI-STAKEHOLDER ECOSYSTEM
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {STAKEHOLDERS.map((st) => (
                  <span 
                    key={st}
                    onClick={() => setSelectedNode('stakeholders')}
                    className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold font-space tracking-wide cursor-pointer transition ${
                      selectedNode === 'stakeholders' 
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                        : 'bg-black/30 text-emerald-300/80 border-emerald-950 hover:border-emerald-800'
                    }`}
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {/* Enabling Technologies layer */}
            <div className="p-4 rounded-xl border border-emerald-950/40 bg-black/30">
              <div className="text-center mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">
                  ENABLING TECHNOLOGIES
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {TECHNOLOGIES.map((tech) => {
                  const TechIcon = tech.icon;
                  return (
                    <div 
                      key={tech.name}
                      onClick={() => setSelectedNode('technologies')}
                      className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center cursor-pointer transition ${
                        selectedNode === 'technologies' 
                          ? 'bg-emerald-950/40 border-emerald-500 text-white' 
                          : 'bg-black/15 border-emerald-950/50 text-gray-500 hover:text-emerald-400 hover:border-emerald-900'
                      }`}
                    >
                      <TechIcon className="h-4 w-4 mb-1" />
                      <span className="text-[8px] font-mono leading-tight font-bold">{tech.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Cyber Control Center Console (Simulator) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/10 rounded-2xl blur-xl opacity-35"></div>
            
            <div className="relative glass-panel rounded-2xl border border-emerald-500/20 p-5 min-h-[500px] flex flex-col justify-between overflow-hidden">
              
              {/* Console Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80 mb-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/80 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider flex items-center gap-1">
                  <Terminal size={11} />
                  ECOSYSTEM_SANDBOX.SH
                </span>
              </div>

              {/* Dynamic Console Body */}
              <div className="flex-1 flex flex-col justify-between">
                
                {/* 1. AI FORECASTING */}
                {selectedNode === 'forecasting' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-space uppercase">AI Yield & Production Forecaster</h4>
                      <p className="text-[11px] text-emerald-200/50 mt-1">
                        Prediksi hasil panen (FFB Yield) per Hektar berdasarkan curah hujan tahunan, dosis pupuk, dan umur tanaman sawit.
                      </p>
                    </div>

                    <div className="space-y-3 bg-black/45 p-3 rounded-lg border border-emerald-950/70 text-xs">
                      {/* Rainfall Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-emerald-200/60">Curah Hujan (Rainfall)</span>
                          <span className="text-white font-bold">{aiRainfall} mm</span>
                        </div>
                        <input 
                          type="range" min="1000" max="4000" step="100" value={aiRainfall} 
                          onChange={(e) => setAiRainfall(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer h-1 rounded-lg bg-emerald-950"
                        />
                      </div>

                      {/* Fertilizer Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-emerald-200/60">Dosis Pupuk (Fertilizer)</span>
                          <span className="text-white font-bold">{aiFertilizer}%</span>
                        </div>
                        <input 
                          type="range" min="50" max="150" step="5" value={aiFertilizer} 
                          onChange={(e) => setAiFertilizer(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer h-1 rounded-lg bg-emerald-950"
                        />
                      </div>

                      {/* Tree Age Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-emerald-200/60">Rata-rata Umur Pohon (Tree Age)</span>
                          <span className="text-white font-bold">{aiTreeAge} Tahun</span>
                        </div>
                        <input 
                          type="range" min="3" max="25" step="1" value={aiTreeAge} 
                          onChange={(e) => setAiTreeAge(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer h-1 rounded-lg bg-emerald-950"
                        />
                      </div>
                    </div>

                    {/* Result and Charts */}
                    <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/20 text-center">
                      <span className="text-[10px] font-mono text-emerald-400 block uppercase">Projected Annual Yield</span>
                      <span className="text-3xl font-extrabold font-space text-white">{calculateForecastYield()} <span className="text-sm font-normal text-emerald-400">Ton/Ha/Year</span></span>
                    </div>

                    {/* Mini SVG Line Chart */}
                    <div className="h-24 bg-black/60 rounded-lg border border-emerald-950/60 p-2 flex flex-col justify-between relative overflow-hidden">
                      <span className="text-[8px] font-mono text-gray-500 absolute top-1.5 left-2">5-YEAR FORECAST GRAPH</span>
                      <svg className="w-full h-full pt-4" viewBox="0 0 100 30" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(16,185,129,0.06)" strokeWidth="0.5"/>
                        <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(16,185,129,0.06)" strokeWidth="0.5"/>
                        {/* Projected Curve */}
                        <path 
                          d={`M 0 25 Q 25 ${30 - parseFloat(calculateForecastYield()) * 0.9} 50 ${28 - parseFloat(calculateForecastYield()) * 1.0} T 100 ${32 - parseFloat(calculateForecastYield()) * 1.1}`} 
                          fill="none" stroke="#10b981" strokeWidth="1.5" className="transition-all duration-300"
                        />
                        {/* Area glow */}
                        <path 
                          d={`M 0 25 Q 25 ${30 - parseFloat(calculateForecastYield()) * 0.9} 50 ${28 - parseFloat(calculateForecastYield()) * 1.0} T 100 ${32 - parseFloat(calculateForecastYield()) * 1.1} L 100 30 L 0 30 Z`} 
                          fill="rgba(16,185,129,0.05)" className="transition-all duration-300"
                        />
                      </svg>
                      <div className="flex justify-between text-[8px] font-mono text-gray-500 px-1">
                        <span>2026</span>
                        <span>2027</span>
                        <span>2028</span>
                        <span>2029</span>
                        <span>2030</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CARBON ACCOUNTING */}
                {selectedNode === 'carbon_accounting' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-space uppercase">Carbon Footprint Calculator</h4>
                      <p className="text-[11px] text-emerald-200/50 mt-1">
                        Perhitungan jejak karbon (Scope 1, 2, 3) & net emisi di pabrik kelapa sawit Anda secara real-time.
                      </p>
                    </div>

                    <div className="space-y-3 bg-black/45 p-3 rounded-lg border border-emerald-950/70 text-xs">
                      {/* FFB input */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-emerald-200/60">Volume TBS Diolah (FFB Volume)</span>
                          <span className="text-white font-bold">{carbonTbs.toLocaleString()} Ton</span>
                        </div>
                        <input 
                          type="range" min="1000" max="50000" step="1000" value={carbonTbs} 
                          onChange={(e) => setCarbonTbs(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer h-1 rounded-lg bg-emerald-950"
                        />
                      </div>

                      {/* Biogas Toggle */}
                      <div className="flex items-center justify-between border-t border-emerald-950/60 pt-2">
                        <span className="text-emerald-200/60 text-[10px] font-mono">Biogas POME (Methane Capture)</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" checked={carbonBiogas} 
                            onChange={(e) => setCarbonBiogas(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-emerald-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-emerald-800 after:border-emerald-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-black"></div>
                        </label>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-black/55 p-3 rounded-lg border border-emerald-950/60 space-y-2 text-xs">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-500">Scope 1 (Boiler & Fuel):</span>
                        <span className="text-gray-300">{calcCarbonScope1()} tCO2e</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-500">Scope 2 (Electricity):</span>
                        <span className="text-gray-300">{calcCarbonScope2()} tCO2e</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-500">Scope 3 (Smallholders):</span>
                        <span className="text-gray-300">{calcCarbonScope3()} tCO2e</span>
                      </div>
                      {carbonBiogas && (
                        <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                          <span>Methane Capture Reduction:</span>
                          <span>-{calcCarbonBiogasReduction()} tCO2e</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-emerald-950/60 pt-1.5 font-bold text-white font-space">
                        <span>NET EMISSIONS:</span>
                        <span className="text-emerald-400">{calcCarbonNet().toLocaleString()} tCO2e</span>
                      </div>
                    </div>

                    {/* Monetization Potential */}
                    {carbonBiogas && (
                      <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="text-emerald-400 h-5 w-5" />
                          <div>
                            <span className="text-[9px] font-mono text-emerald-400 block uppercase">Carbon Offset Potential</span>
                            <span className="text-[11px] font-bold text-white">Estimated Value</span>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-white font-mono">${calcCarbonOffsetUSD().toLocaleString()} USD</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. BLOCKCHAIN TRACEABILITY */}
                {selectedNode === 'traceability' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-space uppercase">Blockchain Batch Ledger</h4>
                      <p className="text-[11px] text-emerald-200/50 mt-1">
                        Ledger blockchain terdesentralisasi merekam setiap serah terima TBS dari petani ke PKS secara transparan.
                      </p>
                    </div>

                    {/* Mining Simulator */}
                    <div className="bg-black/45 p-3 rounded-lg border border-emerald-950/70 space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-emerald-200/60">Simulate Batch Source</span>
                        <select 
                          value={selectedCompany} 
                          onChange={(e) => setSelectedCompany(e.target.value)}
                          className="bg-black border border-emerald-950/60 text-emerald-300 text-[10px] rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          <option value="Borneo">PT Borneo Palm Energy (Kalteng)</option>
                          <option value="Riau">PT Riau Agromakmur (Riau)</option>
                          <option value="Sumut">PT Sumatera Palm Lestari (Sumut)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleMineBlock}
                        disabled={miningStatus === 'mining'}
                        className={`w-full py-2 rounded-lg font-space font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                          miningStatus === 'mining' 
                            ? 'bg-emerald-950 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        }`}
                      >
                        <RefreshCw size={13} className={miningStatus === 'mining' ? 'animate-spin' : ''} />
                        {miningStatus === 'mining' ? 'MEMPROSES BLOCK...' : miningStatus === 'success' ? 'BLOCK TERDAFTAR!' : 'MINT BATCH TBS BARU'}
                      </button>
                    </div>

                    {/* Live Logs */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-emerald-400 block uppercase">Real-Time Blockchain Logs</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {blockchainLogs.map((log, index) => (
                          <div key={index} className="bg-black/35 border border-emerald-950/40 rounded p-2 flex justify-between items-center text-[9px] font-mono">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold">{log.block}</span>
                                <span className="text-emerald-500/50">({log.hash})</span>
                              </div>
                              <div className="text-gray-500 truncate max-w-[170px]">
                                {log.from} &rarr; {log.to}
                              </div>
                            </div>
                            <span className="text-[8px] bg-green-950/40 text-green-400 px-1 rounded border border-green-900/30">
                              {log.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. COMPLIANCE MONITORING */}
                {selectedNode === 'compliance' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-space uppercase">Compliance & Geofencing Monitor</h4>
                      <p className="text-[11px] text-emerald-200/50 mt-1">
                        Audit kepatuhan NDPE (No Deforestation, No Peat, No Exploitation) otomatis dengan satelit remote sensing.
                      </p>
                    </div>

                    <div className="flex justify-between gap-1.5 bg-black/45 p-1.5 rounded-lg border border-emerald-950/60">
                      {['Borneo', 'Riau', 'Sumut'].map((comp) => (
                        <button
                          key={comp}
                          onClick={() => setSelectedCompany(comp)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition ${
                            selectedCompany === comp 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                              : 'text-gray-500 hover:text-emerald-300'
                          }`}
                        >
                          {comp === 'Borneo' ? 'PT Borneo' : comp === 'Riau' ? 'PT Riau' : 'PT Sumut'}
                        </button>
                      ))}
                    </div>

                    {/* Geofencing Radar Map Simulation */}
                    <div className="h-28 w-full bg-black/55 rounded-lg border border-emerald-950/70 p-2 relative flex items-center justify-center overflow-hidden">
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
                      
                      {/* Radar Sweeper */}
                      <div className="absolute w-[200px] h-[200px] border-l border-emerald-500/10 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '6s' }}></div>

                      {/* Map Polygon Simulation */}
                      <svg viewBox="0 0 100 60" className="w-full h-full opacity-70">
                        {/* Map Outline */}
                        <path d="M 10 10 L 90 10 L 85 50 L 15 45 Z" fill="rgba(16,185,129,0.03)" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" strokeDasharray="1 1"/>
                        {/* Geofence area polygon */}
                        <polygon 
                          points={
                            selectedCompany === 'Borneo' ? "30,15 50,12 60,30 40,35" : 
                            selectedCompany === 'Riau' ? "25,25 45,20 50,45 30,50" : 
                            "40,20 70,15 65,40 45,45"
                          } 
                          fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="1"
                        />
                        {/* Selected company coordinate dot */}
                        <circle 
                          cx={selectedCompany === 'Borneo' ? 45 : selectedCompany === 'Riau' ? 38 : 55} 
                          cy={selectedCompany === 'Borneo' ? 22 : selectedCompany === 'Riau' ? 35 : 30} 
                          r="2.5" fill="#10b981" className="animate-ping"
                        />
                        <circle 
                          cx={selectedCompany === 'Borneo' ? 45 : selectedCompany === 'Riau' ? 38 : 55} 
                          cy={selectedCompany === 'Borneo' ? 22 : selectedCompany === 'Riau' ? 35 : 30} 
                          r="1.5" fill="#10b981"
                        />
                      </svg>
                      
                      {/* GPS coordinates sticker */}
                      <div className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-500">
                        {selectedCompany === 'Borneo' ? 'COORDS: -2.215, 113.921' : selectedCompany === 'Riau' ? 'COORDS: 0.534, 101.442' : 'COORDS: 3.595, 98.672'}
                      </div>
                    </div>

                    {/* Verification Status Card */}
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-emerald-200/50">EUDR Deforestation Check:</span>
                        <span className="font-bold text-green-400">PASSED (No Deforest Post-2020)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-200/50">Sertifikasi Legalitas:</span>
                        <span className="font-bold text-white">RSPO & ISPO Terverifikasi</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SMART CONTRACT */}
                {selectedNode === 'smart_contract' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-space uppercase">Smart Contract Escrow</h4>
                      <p className="text-[11px] text-emerald-200/50 mt-1">
                        Eksekusi otomatis pembayaran hasil panen TBS begitu lolos validasi kualitas rendemen & ketertelusuran geofencing.
                      </p>
                    </div>

                    <div className="space-y-2 bg-black/45 p-3 rounded-lg border border-emerald-950/70 text-xs">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-mono text-emerald-200/60 block uppercase">FFB Weight (Kg)</label>
                          <input 
                            type="number" value={contractWeight} 
                            onChange={(e) => setContractWeight(parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-emerald-950 text-white font-mono text-xs rounded p-1.5 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-mono text-emerald-200/60 block uppercase">Price/Kg (IDR)</label>
                          <input 
                            type="number" value={contractPrice} 
                            onChange={(e) => setContractPrice(parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-emerald-950 text-white font-mono text-xs rounded p-1.5 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={handleRunSmartContract}
                        disabled={contractRunning}
                        className={`w-full py-2 rounded-lg font-space font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                          contractRunning 
                            ? 'bg-purple-950 text-purple-400 border border-purple-500/20' 
                            : 'bg-purple-600 text-white hover:bg-purple-500 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        }`}
                      >
                        <Play size={11} className={contractRunning ? 'animate-pulse' : ''} />
                        {contractRunning ? 'EXECUTING CONTRACT...' : 'SIMULATE AUTO PAYOUT'}
                      </button>
                    </div>

                    {/* Console Output */}
                    <div className="h-32 bg-black border border-emerald-950 rounded-lg p-2.5 font-mono text-[9px] overflow-y-auto space-y-1">
                      <div className="text-gray-500">// Smart Contract Payout Logger</div>
                      {contractOutput.map((out, idx) => (
                        <div key={idx} className={out.includes('SUCCESS') ? 'text-emerald-400 font-bold' : out.includes('PASS') ? 'text-cyan-400' : 'text-gray-300'}>
                          {out}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. GREEN SUKUK */}
                {selectedNode === 'green_sukuk' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-space uppercase">Green Sukuk Portfolio</h4>
                      <p className="text-[11px] text-emerald-200/50 mt-1">
                        Obligasi syariah hijau terintegrasi blockchain guna mendanai replanting kelapa sawit rakyat & transisi energi bersih.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: 'Methane Capture - PT Borneo', target: 'Rp 120 Miliar', progress: 85, irr: '8.2%', co2: '45,000t/yr' },
                        { name: 'Solar PV Mill - PT Riau', target: 'Rp 80 Miliar', progress: 92, irr: '7.9%', co2: '28,000t/yr' }
                      ].map((sukuk, idx) => (
                        <div key={idx} className="bg-black/45 p-3 rounded-lg border border-emerald-950/70 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="font-bold text-white font-space">{sukuk.name}</span>
                            <span className="text-emerald-400 font-mono font-bold">{sukuk.irr} IRR</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-gray-500">
                              <span>Funding Progress</span>
                              <span>{sukuk.progress}%</span>
                            </div>
                            <div className="w-full bg-emerald-950/50 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${sukuk.progress}%` }}></div>
                            </div>
                          </div>

                          <div className="flex justify-between text-[9px] font-mono text-emerald-200/50">
                            <span>Target: {sukuk.target}</span>
                            <span className="flex items-center gap-0.5"><Leaf size={9} /> {sukuk.co2} Saved</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. FALLBACK / GENERAL NODES */}
                {![
                  'forecasting', 'carbon_accounting', 'traceability', 
                  'compliance', 'smart_contract', 'green_sukuk'
                ].includes(selectedNode) && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-space uppercase">
                        {LAYERS.flatMap(l => l.items).find(n => n.id === selectedNode)?.name || 
                         (selectedNode === 'stakeholders' ? 'MULTI-STAKEHOLDER' : 'ENABLING TECHNOLOGIES')}
                      </h4>
                      <p className="text-[11px] text-emerald-200/50 mt-1">
                        {LAYERS.flatMap(l => l.items).find(n => n.id === selectedNode)?.desc || 
                         (selectedNode === 'stakeholders' 
                           ? 'Sinergi kolaborasi antara berbagai entitas untuk mewujudkan ekosistem berkelanjutan.' 
                           : 'Teknologi pendukung terintegrasi yang mendasari sistem cerdas PODGE.')}
                      </p>
                    </div>

                    <div className="bg-black/45 p-4 rounded-lg border border-emerald-950/70 text-xs text-center space-y-3 py-6">
                      <Info className="mx-auto text-emerald-500/60" size={24} />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 block uppercase">Ecosystem Node Data</span>
                        <p className="text-gray-300 leading-relaxed max-w-[220px] mx-auto">
                          Fitur ini terintegrasi penuh ke database inti. Silakan masuk ke dashboard utama untuk melihat data audit langsung.
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/25">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span>DATABASE INTEGRATION ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Console Footer */}
              <div className="border-t border-emerald-950/80 pt-3 mt-4 text-[9px] font-mono text-gray-500 flex items-center justify-between">
                <span>SYSTEM STATUS: COMPLIANT</span>
                <span className="text-emerald-500/60 font-bold animate-pulse">ONLINE [NODE-2.0]</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
