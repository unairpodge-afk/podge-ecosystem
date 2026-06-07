'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  Coins, 
  ArrowRight, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

export default function OnboardingWizard({ identity }: { identity: any }) {
  const role = identity.identity_type;
  
  // Determine if onboarding is completed
  const isFarmerCompleted = role === 'farmer' && !!identity.linked_farm_id;
  const isCompanyCompleted = role === 'company' && !!identity.metadata?.downstream;
  const isInvestorCompleted = role === 'investor' && !!identity.metadata?.investor_profile;
  
  const isCompleted = isFarmerCompleted || isCompanyCompleted || isInvestorCompleted;
  
  const [isOpen, setIsOpen] = useState(!isCompleted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Farmer Form
  const [farmerName, setFarmerName] = useState(identity.display_name || '');
  const [cooperativeName, setCooperativeName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [areaHectare, setAreaHectare] = useState('2.5');

  // Company Form
  const [idPks, setIdPks] = useState('');
  const [tanggalTerima, setTanggalTerima] = useState('07 Juni 2026');
  const [beratNetto, setBeratNetto] = useState('');
  const [rendemen, setRendemen] = useState('');
  const [outputCpo, setOutputCpo] = useState('');

  // Investor Form
  const [investorName, setInvestorName] = useState(identity.display_name || '');
  const [plannedInvestment, setPlannedInvestment] = useState('100000000'); // 100M
  const [focus, setFocus] = useState('biogas');

  if (!isOpen) return null;

  // Auto-fill realistic mock values for easy onboarding
  const handleQuickSimulate = () => {
    if (role === 'farmer') {
      setFarmerName(identity.display_name || 'Kelompok Tani Berkah Riau');
      setCooperativeName('Koperasi Produsen Sawit Lestari');
      setVillage('Desa Sei Pagar');
      setDistrict('Kampar');
      setProvince('Riau');
      setAreaHectare('5.2');
    } else if (role === 'company') {
      setIdPks('PKS-DUMAI-015');
      setTanggalTerima('07 Juni 2026');
      setBeratNetto('8.500 Kg');
      setRendemen('23.2%');
      setOutputCpo('1.97 Ton');
    } else if (role === 'investor') {
      setInvestorName(identity.display_name || 'Al-Barakah Capital Indonesia');
      setPlannedInvestment('150000000'); // 150M
      setFocus('biogas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'farmer') {
        // Create Farm ID
        const res = await fetch('/api/farmid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerName,
            cooperativeName,
            village,
            district,
            province,
            areaHectare: parseFloat(areaHectare) || 0
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Gagal mendaftarkan FarmID.');
          setLoading(false);
          return;
        }
      } else if (role === 'company') {
        // Save Downstream supply chain data
        const res = await fetch('/api/identity/update-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            downstream: {
              step4: { 
                idPks: idPks.trim() || '-', 
                tanggalTerima: tanggalTerima.trim() || '-', 
                beratNetto: beratNetto.trim() || '0 Kg', 
                rendemen: rendemen.trim() || '0%', 
                outputCpo: outputCpo.trim() || '0 Ton' 
              },
              step5: { 
                idBatchCpo: `BATCH-CPO-${idPks.toUpperCase() || 'NEW'}`, 
                volume: outputCpo.trim() || '0 Ton', 
                kadarAir: '0.15%', 
                ffa: '3.1%', 
                tanggalProduksi: tanggalTerima.trim() || '-' 
              },
              step6: { 
                idRefinery: 'REF-DUMAI-DEFAULT', 
                inputCpo: outputCpo.trim() || '0 Ton', 
                produkTurunan: 'RBD Palm Olein', 
                yield: '78.5%', 
                tanggalProduksi: tanggalTerima.trim() || '-' 
              },
              step7: { 
                negaraTujuan: 'Rotterdam, Belanda (EU)', 
                buyer: 'Global Oils Trading', 
                volumeEkspor: '0.00 Ton', 
                noKontainer: '-', 
                billOfLading: '-' 
              }
            }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Gagal menyimpan data supply chain.');
          setLoading(false);
          return;
        }
      } else if (role === 'investor') {
        // Save Investor Profile
        const res = await fetch('/api/identity/update-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investor_profile: {
              investorName,
              plannedInvestment: parseFloat(plannedInvestment) || 0,
              focus,
              initializedAt: new Date().toISOString()
            }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Gagal menyimpan profil investor.');
          setLoading(false);
          return;
        }
      }

      setIsOpen(false);
      window.location.reload();
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] my-8">
        
        {/* Header decoration */}
        <div className="border-b border-emerald-900/60 bg-emerald-950/20 px-6 py-5 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-space text-lg font-bold text-white">Inisiasi Data Ledger Ekosistem</h3>
            <p className="text-[10px] text-emerald-300/60 font-mono mt-0.5">PODGE ECOSYSTEM ONBOARDING SETUP</p>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/25 p-4 text-xs text-red-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5 text-xs text-emerald-100/70 leading-relaxed bg-emerald-950/15 p-4 rounded-xl border border-emerald-900/20">
            Selamat bergabung di PODGE Ecosystem! Sebagai <strong>{role === 'farmer' ? 'Petani' : role === 'company' ? 'Perusahaan / PKS' : 'Investor'}</strong>, Anda wajib menginisiasi entri ledger pertama Anda untuk mengaktifkan visualisasi dashboard yang sesuai dengan peran Anda secara real-time.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* FARMER FORM */}
            {role === 'farmer' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-emerald-400">
                  NAMA PETANI / KELOMPOK
                  <input required value={farmerName} onChange={e => setFarmerName(e.target.value)} placeholder="Nama petani atau kelompok tani" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                </label>
                <label className="block text-xs font-semibold text-emerald-400">
                  NAMA KOPERASI MITRA
                  <input required value={cooperativeName} onChange={e => setCooperativeName(e.target.value)} placeholder="Contoh: KUD Karya Sawit" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-emerald-400">
                    LUAS KEBUN (HEKTAR)
                    <input required type="number" step="0.1" value={areaHectare} onChange={e => setAreaHectare(e.target.value)} placeholder="Contoh: 2.5" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                  </label>
                  <label className="block text-xs font-semibold text-emerald-400">
                    DESA / KELURAHAN
                    <input required value={village} onChange={e => setVillage(e.target.value)} placeholder="Desa kebun Anda" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-emerald-400">
                    KECAMATAN / KABUPATEN
                    <input required value={district} onChange={e => setDistrict(e.target.value)} placeholder="Wilayah kebun Anda" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                  </label>
                  <label className="block text-xs font-semibold text-emerald-400">
                    PROVINSI
                    <input required value={province} onChange={e => setProvince(e.target.value)} placeholder="Contoh: Riau" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                  </label>
                </div>
              </div>
            )}

            {/* COMPANY FORM */}
            {role === 'company' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-emerald-400">
                  ID PKS UTAMA
                  <input required value={idPks} onChange={e => setIdPks(e.target.value)} placeholder="Contoh: PKS-SAWIT-01" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-emerald-400">
                    BERAT NETTO PENERIMAAN AWAL
                    <input required value={beratNetto} onChange={e => setBeratNetto(e.target.value)} placeholder="Contoh: 5.000 Kg" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                  </label>
                  <label className="block text-xs font-semibold text-emerald-400">
                    RENDEMEN CPO AWAL
                    <input required value={rendemen} onChange={e => setRendemen(e.target.value)} placeholder="Contoh: 23.5%" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-emerald-400">
                  OUTPUT VOLUME CPO AWAL
                  <input required value={outputCpo} onChange={e => setOutputCpo(e.target.value)} placeholder="Contoh: 1.15 Ton" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                </label>
              </div>
            )}

            {/* INVESTOR FORM */}
            {role === 'investor' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-emerald-400">
                  NAMA ENTITAS/LEMBAGA INVESTOR
                  <input required value={investorName} onChange={e => setInvestorName(e.target.value)} placeholder="Contoh: Al-Barakah Capital" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                </label>
                <label className="block text-xs font-semibold text-emerald-400">
                  RENCANA ALOKASI DANA INVESTASI (RP)
                  <input required type="number" value={plannedInvestment} onChange={e => setPlannedInvestment(e.target.value)} placeholder="Contoh: 100000000" className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white outline-none mt-1.5 focus:border-emerald-500" />
                </label>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-emerald-400">FOKUS INVESTASI UTAMA</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'biogas', label: 'Biogas POME Capture', desc: 'Carbon Reduction' },
                      { key: 'replanting', label: 'PSR Replanting', desc: 'Farmer Re-forestation' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setFocus(opt.key)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          focus === opt.key 
                            ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300' 
                            : 'border-emerald-950 bg-black/25 text-emerald-200/50 hover:border-emerald-800'
                        }`}
                      >
                        <span className="block font-bold text-xs">{opt.label}</span>
                        <span className="block text-[10px] opacity-60 mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={handleQuickSimulate}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                Gunakan Isian Cepat (Simulasi)
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-5 py-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Inisiasi...' : 'Kirim Inisiasi Ledger'}
                {!loading && <ArrowRight size={14} />}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
