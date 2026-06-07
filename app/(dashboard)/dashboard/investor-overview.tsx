'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Leaf, 
  Sliders, 
  Award, 
  CheckCircle2, 
  Info,
  Activity,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Search,
  BookMarked,
  RotateCcw,
  Check,
  AlertTriangle
} from 'lucide-react';

interface Question {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

const quizQuestions: Question[] = [
  {
    text: "Berapa rata-rata rendemen CPO (Crude Palm Oil) yang diekstrak dari TBS (Tandan Buah Segar)?",
    options: [
      "5% - 8%",
      "12% - 15%",
      "20% - 23% (Rata-rata standar PKS)",
      "30% - 35%"
    ],
    correctAnswerIndex: 2,
    explanation: "Rendemen rata-rata CPO dari TBS kelapa sawit berkisar antara 20% sampai 23%. Artinya, dari 1 ton TBS dapat dihasilkan sekitar 200-230 kg CPO mentah."
  },
  {
    text: "Mengapa lahan gambut (peatland) memiliki proteksi tinggi dalam kepatuhan NDPE/ISPO?",
    options: [
      "Karena tanah gambut mengandung kadar pasir beracun",
      "Gambut menyimpan cadangan karbon masif; jika dikeringkan/dibakar melepas emisi CO2 ekstrem & rawan karhutla",
      "Kelapa sawit sama sekali tidak dapat tumbuh di lahan gambut",
      "Tanah gambut merupakan hak milik eksklusif industri kosmetik dunia"
    ],
    correctAnswerIndex: 1,
    explanation: "Lahan gambut menyimpan karbon raksasa. Pengeringan (drainase) lahan gambut untuk kebun kelapa sawit melepaskan emisi karbon luar biasa ke udara serta membuatnya sangat mudah terbakar saat kemarau."
  },
  {
    text: "Apa peran utama sistem 'Geofencing' poligon lahan kelapa sawit terkait kepatuhan regulasi EUDR?",
    options: [
      "Menyediakan pagar listrik fisik di batas kebun rakyat",
      "Merekam titik koordinat poligon kebun untuk menjamin buah sawit tidak berasal dari lahan deforestasi pasca 2020",
      "Membantu petani mendeteksi kadar air buah sawit dengan gelombang suara",
      "Mengurangi pajak ekspor TBS ke wilayah Eropa secara otomatis"
    ],
    correctAnswerIndex: 1,
    explanation: "EUDR (European Union Deforestation Regulation) mewajibkan ketertelusuran koordinat poligon kebun sawit untuk memastikan buah tidak berasal dari lahan hutan yang dialihfungsikan setelah 31 Desember 2020."
  }
];

const glossaryTerms = [
  { term: "TBS", category: "agronomy", title: "Tandan Buah Segar", definition: "Buah kelapa sawit utuh yang baru dipanen dari pohon dan siap dikirim ke Pabrik Kelapa Sawit (PKS) untuk diolah menjadi minyak mentah." },
  { term: "CPO", category: "supply-chain", title: "Crude Palm Oil", definition: "Minyak sawit mentah hasil ekstraksi daging buah sawit (mesokarp) berwarna oranye kemerahan yang menjadi bahan dasar minyak goreng, mentega, dan oleokimia." },
  { term: "Rendemen", category: "supply-chain", title: "Rasio Ekstraksi Minyak", definition: "Persentase minyak sawit mentah yang berhasil diekstrak dibanding total berat TBS yang diproses (nilai normal PKS: 20-23%)." },
  { term: "STDB", category: "sustainability", title: "Surat Tanda Daftar Budidaya", definition: "Dokumen pendaftaran resmi dari dinas perkebunan untuk kebun sawit rakyat dengan luas di bawah 25 hektar guna memastikan aspek legalitas lahan." },
  { term: "SPPL", category: "sustainability", title: "Surat Pernyataan Pengelolaan Lingkungan", definition: "Komitmen kesanggupan dari petani untuk menjaga kebersihan dan meminimalkan dampak negatif lingkungan dari kebun sawit mandiri." },
  { term: "EUDR", category: "sustainability", title: "EU Deforestation Regulation", definition: "Regulasi Uni Eropa yang melarang peredaran komoditas kelapa sawit yang bersumber dari lahan hasil deforestasi/penebangan hutan setelah tanggal 31 Desember 2020." },
  { term: "ISPO", category: "sustainability", title: "Indonesian Sustainable Palm Oil", definition: "Sertifikasi keberlanjutan sawit mandatory (wajib) yang dirancang oleh Pemerintah Indonesia untuk meningkatkan daya saing pasar global." },
  { term: "RSPO", category: "sustainability", title: "Roundtable on Sustainable Palm Oil", definition: "Asosiasi non-profit global yang menetapkan standar keberlanjutan sukarela (voluntary) kelapa sawit yang diakui pasar internasional secara multilateral." },
  { term: "NDPE", category: "sustainability", title: "No Deforestation, No Peat, No Exploitation", definition: "Kebijakan global rantai pasok industri sawit untuk tidak merusak hutan bernilai konservasi tinggi, melindungi lahan gambut, dan menolak eksploitasi hak pekerja/petani." },
  { term: "HCV / NKT", category: "agronomy", title: "High Conservation Value", definition: "Nilai Konservasi Tinggi, merujuk pada ekosistem hutan, satwa liar, atau budaya lokal penting yang harus dikecualikan dan tidak boleh dialihkan menjadi kebun sawit." }
];

export default function InvestorOverview() {
  // Simulator State
  const [landArea, setLandArea] = useState<number>(5); // Default 5 Hectares
  const [soilQuality, setSoilQuality] = useState<'prime' | 'standard' | 'peat'>('prime');

  // Dynamic Learning Platform States
  const [completedModules, setCompletedModules] = useState<number>(2);
  const [points, setPoints] = useState<number>(850);
  const [certs, setCerts] = useState([
    {
      code: 'CERT-AGR-RIAU-041',
      name: 'Dasar Agronomi & Budidaya Kebun Sawit Mandiri',
      date: '15 Mei 2026',
      score: '92 / 100',
      status: 'Verified & Active'
    },
    {
      code: 'CERT-ESG-EUDR-108',
      name: 'Kepatuhan Deforestasi & Standar EUDR Dasar',
      date: '02 Juni 2026',
      score: '88 / 100',
      status: 'Verified & Active'
    }
  ]);

  // Quiz Engine State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answersSubmitted, setAnswersSubmitted] = useState<boolean[]>([]); // Tracks true/false score per question
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [claimingLedger, setClaimingLedger] = useState(false);
  const [certificateClaimed, setCertificateClaimed] = useState(false);

  // Glossary State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'agronomy' | 'sustainability' | 'supply-chain'>('all');
  const [selectedTerm, setSelectedTerm] = useState<string | null>("EUDR");

  // Calculates educational yield & carbon absorption based on soil & land area
  const getSimulatedYields = () => {
    let tbsYieldPerHa = 22; // 22 Tons per Hectare per year for Prime soil
    let carbonAbsorbedPerHa = 14.5; // 14.5 tCO2e per Ha per year
    let soilLabel = '';

    if (soilQuality === 'prime') {
      tbsYieldPerHa = 24.5;
      carbonAbsorbedPerHa = 16.2;
      soilLabel = 'Tanah Mineral Subur (Utama)';
    } else if (soilQuality === 'standard') {
      tbsYieldPerHa = 19.0;
      carbonAbsorbedPerHa = 13.8;
      soilLabel = 'Tanah Liat Berpasir (Standar)';
    } else {
      tbsYieldPerHa = 12.5;
      carbonAbsorbedPerHa = 8.5; // Peatland has lower relative absorption & high risks
      soilLabel = 'Lahan Gambut (Sensitif)';
    }

    const annualTbsProduction = landArea * tbsYieldPerHa;
    const annualCpoProduction = annualTbsProduction * 0.225; // 22.5% average rendemen CPO
    const totalCarbonOffset = landArea * carbonAbsorbedPerHa;

    return {
      tbsYieldPerHa: tbsYieldPerHa.toFixed(1) + ' Ton/Ha',
      annualTbsProduction: Math.round(annualTbsProduction).toLocaleString('id-ID') + ' Ton',
      annualCpoProduction: Math.round(annualCpoProduction).toLocaleString('id-ID') + ' Ton',
      totalCarbonOffset: Math.round(totalCarbonOffset).toLocaleString('id-ID') + ' tCO2e',
      soilLabel
    };
  };

  const sim = getSimulatedYields();

  // Quiz Handlers
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswersSubmitted([]);
    setQuizCompleted(false);
    setQuizScore(0);
    setShowExplanation(false);
  };

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return; // Prevent change after answer locked
    setSelectedAnswer(idx);
  };

  const handleLockAnswer = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswerIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setAnswersSubmitted(prev => [...prev, isCorrect]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleClaimCertificate = () => {
    setClaimingLedger(true);
    setTimeout(() => {
      setClaimingLedger(false);
      setCertificateClaimed(true);
      setCompletedModules(3);
      setPoints(1000);
      
      // Dynamic Certificate object
      const newCert = {
        code: 'CERT-VAL-CPO-202',
        name: 'Rantai Pasok Hilir & Sertifikasi EUDR Lanjutan',
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        score: '100 / 100',
        status: 'Verified & Active'
      };
      
      // Append only if it is not already in list
      if (!certs.some(c => c.code === 'CERT-VAL-CPO-202')) {
        setCerts(prev => [...prev, newCert]);
      }
    }, 1500);
  };

  // Glossary filtering
  const filteredTerms = glossaryTerms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedTermData = glossaryTerms.find(t => t.term === selectedTerm);

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: LEARNING HUB METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Modules Completed */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/15 bg-black/45 hover:border-amber-500/35 transition flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">MODUL DISELESAIKAN</span>
              <h4 className="text-3xl font-extrabold text-white font-space">{completedModules} / 5 Modul</h4>
              <p className="text-xs text-emerald-200/50 mt-1">Dasar agronomi & kepatuhan hijau sawit rakyat selesai dipelajari</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-200/40">Level Pemahaman:</span>
            <span className="font-bold text-amber-400 font-mono">
              {completedModules >= 3 ? 'Professional Graduate' : 'Intermediate Learner'}
            </span>
          </div>
        </div>

        {/* Card 2: Carbon Literacy Points */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/15 bg-black/45 hover:border-emerald-500/35 transition flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">LITERASI LINGKUNGAN</span>
              <h4 className="text-3xl font-extrabold text-white font-space">{points} Poin</h4>
              <p className="text-xs text-emerald-200/50 mt-1">Poin yang diperoleh dari latihan kuis, sertifikasi EUDR dan dekarbonisasi</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Leaf size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-200/40">Status Prestasi:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {points >= 1000 ? '⭐ Sawit Guardian' : '🌱 Green Scholar'}
            </span>
          </div>
        </div>

        {/* Card 3: Live Webinars or Dynamic Next Class */}
        <div className="glass-panel p-6 rounded-2xl border border-blue-500/15 bg-black/45 hover:border-blue-500/35 transition flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">KELAS LIVE TERDEKAT</span>
              <h4 className="text-2xl font-extrabold text-white font-space">10 Juni 2026</h4>
              <p className="text-xs text-emerald-200/55 mt-1">Webinar interaktif: "Penerapan Standardisasi ISPO dan EUDR untuk Petani Swadaya"</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-200/40">Penyelenggara:</span>
            <span className="font-bold text-blue-400 font-mono">Lembaga Podge Edukasi</span>
          </div>
        </div>

      </div>

      {/* SECTION 2: GRID OF STUDY SIMULATOR AND CURRICULUM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Agronomy & Carbon Simulator */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-black/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Sliders size={16} />
              </div>
              <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider">
                Simulasi Hasil Kebun & Karbon
              </h4>
            </div>
            
            <p className="text-xs text-emerald-200/60 leading-relaxed">
              Modul Simulator: Geser luas hektar dan pilih kategori lahan untuk menghitung potensi panen TBS, minyak sawit mentah (CPO), serta serapan karbon dioksida per tahun.
            </p>

            {/* Soil Quality Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/50 rounded-xl border border-emerald-950/60">
              {[
                { key: 'prime', label: 'Mineral' },
                { key: 'standard', label: 'Liat Berpasir' },
                { key: 'peat', label: 'Gambut' }
              ].map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSoilQuality(s.key as any)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold font-space transition-all cursor-pointer ${
                    soilQuality === s.key 
                      ? 'bg-emerald-500 text-black shadow-md' 
                      : 'text-emerald-300/60 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Slider for Hectares */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-200/40">LUAS KEBUN SIMULASI:</span>
                <span className="text-white font-bold">{landArea} Hektar</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={landArea}
                onChange={e => setLandArea(Number(e.target.value))}
                className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-emerald-200/35">
                <span>1 Ha</span>
                <span>50 Ha</span>
              </div>
            </div>

          </div>

          {/* Simulated Results Box */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-emerald-950/60 pb-2">
              <span className="text-emerald-200/60">Kondisi Lahan Terpilih:</span>
              <span className="font-bold text-white text-right truncate max-w-[170px]">{sim.soilLabel}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-emerald-200/40 font-mono block">PRODUKTIVITAS LAHAN</span>
                <span className="text-xs font-extrabold text-emerald-400 mt-1 block">{sim.tbsYieldPerHa} / Thn</span>
              </div>
              <div>
                <span className="text-[9px] text-emerald-200/40 font-mono block">PRODUKSI TBS TAHUNAN</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{sim.annualTbsProduction}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-950/40">
              <div>
                <span className="text-[9px] text-emerald-200/40 font-mono block">ESTIMASI RENDEMEN CPO</span>
                <span className="text-xs font-extrabold text-emerald-400 mt-1 block">{sim.annualCpoProduction}</span>
              </div>
              <div>
                <span className="text-[9px] text-emerald-200/40 font-mono block">SERAPAN EMISI NET</span>
                <span className="text-xs font-extrabold text-emerald-400 mt-1 block">{sim.totalCarbonOffset}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Palm Oil Modules Progress */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-black/30 flex flex-col justify-between space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity size={16} />
            </div>
            <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider">
              Kurikulum & Progress Belajar Sawit
            </h4>
          </div>

          <div className="space-y-4">
            
            {/* Module 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">Modul 1: Agronomi & Budidaya Kebun Sawit</span>
                  <span className="text-[9px] text-emerald-400/50 block font-mono">Pembibitan Unggul, Jarak Tanam optimal, Pemupukan NPK</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">100% (Selesai)</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-emerald-950/50 h-2 rounded-full overflow-hidden border border-emerald-900/30">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Module 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">Modul 2: Regulasi Kepatuhan EUDR & Sertifikasi ISPO/RSPO</span>
                  <span className="text-[9px] text-blue-400/50 block font-mono">Poligon Lahan Bebas Deforestasi, Legalitas STDB/SPPL</span>
                </div>
                <span className="font-mono text-blue-400 font-bold">
                  {completedModules >= 3 ? '100% (Selesai)' : '45% (Sedang Dipelajari)'}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-blue-950/50 h-2 rounded-full overflow-hidden border border-blue-900/30">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: completedModules >= 3 ? '100%' : '45%' }}></div>
              </div>
            </div>

            {/* Module 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">Modul 3: Rantai Pasok Hilir (PKS & Refinery CPO)</span>
                  <span className="text-[9px] text-cyan-400/50 block font-mono">Timbangan PKS, Rendemen, Penurunan Kadar FFA, Ekspor Pelabuhan</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">
                  {completedModules >= 3 ? '15% (Mulai Belajar)' : '0% (Belum Mulai)'}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-cyan-950/50 h-2 rounded-full overflow-hidden border border-cyan-900/30">
                <div className="bg-cyan-500 h-full rounded-full transition-all duration-1000" style={{ width: completedModules >= 3 ? '15%' : '0%' }}></div>
              </div>
            </div>

            {/* Locked modules info */}
            <div className="p-3 bg-black/40 rounded-xl border border-emerald-950 text-[11px] text-emerald-300/60 leading-relaxed">
              <p className="font-bold text-white text-[10px] mb-1 font-space uppercase">📚 Modul Tambahan Segera Datang:</p>
              Modul 4: Pembiayaan Sukuk Hijau & Kontrak Syariah Sawit. Modul 5: Valuasi Kredit Karbon & Dekarbonisasi Perkebunan Sawit Rakyat.
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 3: INTERACTIVE QUIZ & PALM OIL GLOSSARY DICTIONARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Interactive Quiz Box */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/10 bg-black/25 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between border-b border-amber-500/10 pb-4 mb-4">
              <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400" />
                Ujian Sertifikasi: Kepatuhan Sawit Rakyat
              </h4>
              <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                +150 Poin Literasi
              </span>
            </div>

            {!quizStarted ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <GraduationCap size={28} />
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-white">Evaluasi Standardisasi ISPO & EUDR</h5>
                  <p className="text-xs text-emerald-200/50 max-w-sm mx-auto leading-relaxed">
                    Selesaikan kuis 3 pertanyaan dengan benar untuk menerbitkan Sertifikat Kepatuhan Lanjutan langsung ke sistem Ledger Verifikasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-lg shadow-amber-500/10"
                >
                  <span>Mulai Ujian</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : quizCompleted ? (
              <div className="text-center py-6 space-y-5">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-base font-bold text-white">Ujian Selesai!</h5>
                  <p className="text-xs text-emerald-200/60">
                    Anda berhasil menjawab <strong className="text-emerald-400">{quizScore} dari 3</strong> pertanyaan dengan benar.
                  </p>
                </div>

                {quizScore === 3 ? (
                  <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-800/30 max-w-md mx-auto space-y-3">
                    <p className="text-xs text-emerald-300 leading-relaxed font-semibold">
                      🎉 Skor Sempurna! Selamat, Anda berhak menerima sertifikat kelulusan yang terverifikasi Ledger.
                    </p>
                    
                    {certificateClaimed ? (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                        <Check size={14} />
                        <span>Sertifikat Terdaftar di Ledger Blockchain!</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleClaimCertificate}
                        disabled={claimingLedger}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {claimingLedger ? (
                          <>
                            <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            <span>Mendaftarkan ke Ledger...</span>
                          </>
                        ) : (
                          <>
                            <Award size={14} />
                            <span>Klaim Sertifikat ke Ledger</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-950/20 rounded-xl border border-yellow-800/30 max-w-md mx-auto space-y-3">
                    <p className="text-xs text-yellow-300 leading-relaxed">
                      Anda membutuhkan skor sempurna (3/3) untuk menerbitkan sertifikat. Coba kembali untuk mengulang materi dan mengklaim sertifikat.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-extrabold text-xs py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw size={14} />
                      <span>Ulangi Ujian</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Question counter */}
                <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300/40">
                  <span>SOAL {currentQuestionIndex + 1} DARI {quizQuestions.length}</span>
                  <span className="bg-emerald-950 px-2 py-0.5 rounded">
                    Score: {quizScore}
                  </span>
                </div>

                {/* Question text */}
                <h5 className="text-xs font-bold text-white leading-relaxed">
                  {quizQuestions[currentQuestionIndex].text}
                </h5>

                {/* Options list */}
                <div className="space-y-2 pt-2">
                  {quizQuestions[currentQuestionIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === quizQuestions[currentQuestionIndex].correctAnswerIndex;
                    let optionStyle = "border-emerald-950 bg-black/45 text-emerald-200/80 hover:border-amber-500/30 hover:bg-amber-950/5";
                    
                    if (showExplanation) {
                      if (isCorrect) {
                        optionStyle = "border-emerald-500 bg-emerald-950/20 text-emerald-300 font-semibold";
                      } else if (isSelected) {
                        optionStyle = "border-red-500 bg-red-950/20 text-red-300";
                      } else {
                        optionStyle = "border-emerald-950 opacity-40 text-emerald-200/40";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-amber-500 bg-amber-950/25 text-amber-200";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={showExplanation}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${optionStyle}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {showExplanation && isCorrect && <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-2" />}
                          {showExplanation && isSelected && !isCorrect && <AlertTriangle size={14} className="text-red-400 shrink-0 ml-2" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation text box */}
                {showExplanation && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-[11px] text-emerald-300/85 leading-relaxed">
                    <p className="font-bold text-emerald-400 mb-0.5">Penjelasan:</p>
                    {quizQuestions[currentQuestionIndex].explanation}
                  </div>
                )}

                {/* Nav buttons */}
                <div className="pt-2 flex justify-end">
                  {!showExplanation ? (
                    <button
                      type="button"
                      onClick={handleLockAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-extrabold text-xs px-5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Kunci Jawaban
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{currentQuestionIndex < quizQuestions.length - 1 ? 'Pertanyaan Berikutnya' : 'Lihat Hasil'}</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Reset button inside running quiz */}
          {quizStarted && (
            <div className="mt-4 pt-3 border-t border-emerald-950/40 flex justify-between items-center text-[10px] text-emerald-300/40">
              <span>Ujian Keberlanjutan Podge v2</span>
              <button 
                onClick={handleStartQuiz}
                type="button" 
                className="hover:text-white flex items-center gap-1 cursor-pointer font-mono font-bold"
              >
                <RotateCcw size={10} /> Reset Ujian
              </button>
            </div>
          )}
        </div>

        {/* Right: Palm Oil Glossary Dictionary */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-black/25 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-4">
              <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider flex items-center gap-2">
                <BookMarked size={16} className="text-emerald-400" />
                Kamus & Glosarium Sawit (SawitPedia)
              </h4>
              <span className="text-[10px] font-mono text-emerald-400/50">
                10 Istilah Utama
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-emerald-300/40" />
              <input
                type="text"
                placeholder="Cari istilah sawit (CPO, EUDR, TBS, dll)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-emerald-950 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-emerald-300/20 focus:outline-none focus:border-emerald-500/40"
              />
            </div>

            {/* Category selection tabs */}
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'agronomy', label: 'Agronomi' },
                { key: 'sustainability', label: 'Keberlanjutan' },
                { key: 'supply-chain', label: 'Rantai Pasok' }
              ].map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActiveCategory(c.key as any)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    activeCategory === c.key 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'text-emerald-300/40 hover:text-white border border-transparent'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Terms grid list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTerms.map(t => (
                <button
                  key={t.term}
                  type="button"
                  onClick={() => setSelectedTerm(t.term)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer truncate ${
                    selectedTerm === t.term 
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 font-bold' 
                      : 'border-emerald-950/50 bg-black/40 text-emerald-300/60 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">{t.term}</span>
                  <span className="text-[9px] text-emerald-400/40 block font-normal truncate">{t.title}</span>
                </button>
              ))}

              {filteredTerms.length === 0 && (
                <div className="col-span-full text-center py-6 text-emerald-300/30 text-xs">
                  Tidak ada istilah yang cocok dengan pencarian.
                </div>
              )}
            </div>

          </div>

          {/* Definition Viewer Box */}
          {selectedTermData && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-950/15 border border-emerald-900/30 space-y-1.5 transition-all">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-extrabold text-white font-space">
                  {selectedTermData.term} - {selectedTermData.title}
                </h5>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                  {selectedTermData.category === 'agronomy' ? 'Agronomi' : selectedTermData.category === 'sustainability' ? 'Keberlanjutan' : 'Rantai Pasok'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/75 leading-relaxed">
                {selectedTermData.definition}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* SECTION 4: MY COMPLETED LEDGER CERTIFICATES */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white font-space uppercase tracking-wider flex items-center gap-2">
          <Award size={16} className="text-amber-400" />
          Sertifikat Kelulusan Belajar (Ledger Verified)
        </h4>

        <div className="glass-panel overflow-x-auto rounded-xl border border-emerald-950/60 bg-black/20">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-emerald-950/80 bg-black/40 text-emerald-400 font-mono uppercase tracking-wider text-[10px]">
                <th className="p-4">Kode Sertifikat</th>
                <th className="p-4">Nama Modul Pelatihan</th>
                <th className="p-4">Tanggal Lulus</th>
                <th className="p-4">Skor Ujian</th>
                <th className="p-4 text-center">Status Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40 font-medium">
              {certs.map(c => (
                <tr key={c.code} className="hover:bg-emerald-950/5 transition-colors">
                  <td className="p-4 font-mono text-white">{c.code}</td>
                  <td className="p-4 text-emerald-100">{c.name}</td>
                  <td className="p-4 text-emerald-300/80">{c.date}</td>
                  <td className="p-4 text-emerald-400 font-semibold">{c.score}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-mono">
                      <CheckCircle2 size={11} /> {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
