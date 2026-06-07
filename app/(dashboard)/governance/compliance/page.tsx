import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle, Flame, Leaf, Database, Scale, Timer, Landmark } from 'lucide-react';

export const dynamic = 'force-dynamic';

type ComplianceRecord = {
  id: string | number;
  company_name: string;
  certification_type: string;
  status: string;
  audit_score: number | string;
  audit_date: string | Date;
};

export default async function CompliancePage() {
  let records: ComplianceRecord[] = [];

  try {
    const dbResult = await query<ComplianceRecord>('SELECT * FROM compliance_evaluations ORDER BY audit_date DESC');
    records = dbResult.rows;
  } catch (e) {
    console.error('Gagal mengambil data compliance_evaluations:', e);
  }

  async function addEvaluation(formData: FormData) {
    'use server';

    const companyName = formData.get('company_name') as string;
    const certificationType = formData.get('certification_type') as string;
    const status = formData.get('status') as string;
    const auditScore = Number(formData.get('audit_score'));
    const auditDate = formData.get('audit_date') as string;

    await query(
      `INSERT INTO compliance_evaluations (company_name, certification_type, status, audit_score, audit_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [companyName, certificationType, status, auditScore, auditDate]
    );

    revalidatePath('/governance/compliance');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          ESG Compliance Layer
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">EUDR & ESG Compliance Monitor</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Gerbang verifikasi kelayakan Uni Eropa (EUDR), sertifikasi ISPO/RSPO, perlindungan gambut, dan jejak karbon TBS.
        </p>
      </div>

      {/* Overview Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-emerald-950">
          <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">EUDR Compliance Rate</p>
          <p className="text-2xl font-extrabold text-white mt-2 font-space">98.4% Passed</p>
          <p className="text-xs text-emerald-200/55 mt-1">Lahan bebas deforestasi pasca-2020</p>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-emerald-950">
          <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Total Area Audit Geofence</p>
          <p className="text-2xl font-extrabold text-white mt-2 font-space">145.200 Ha</p>
          <p className="text-xs text-emerald-200/55 mt-1">Terpetakan polygon koordinat digital</p>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-emerald-950">
          <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Rata-Rata Jejak Karbon</p>
          <p className="text-2xl font-emerald-400 font-extrabold mt-2 font-space">118 kg CO2e / t</p>
          <p className="text-xs text-emerald-200/55 mt-1">Intensitas karbon TBS tersertifikasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-xl border border-emerald-500/10 sticky top-6">
            <h2 className="text-lg font-semibold text-emerald-50 mb-4 flex items-center font-space">
              <FileText size={18} className="mr-2 text-emerald-400" /> Rekam Audit ESG Baru
            </h2>
            <form action={addEvaluation} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Nama Entitas / Perusahaan / Koperasi</label>
                <input type="text" name="company_name" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" placeholder="KUD Sawit Mandiri Riau..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Standar Audit</label>
                  <select name="certification_type" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500">
                    <option value="EUDR Compliant">EUDR Compliance</option>
                    <option value="ISPO">ISPO</option>
                    <option value="RSPO">RSPO</option>
                    <option value="NDPE Audit">NDPE Audit</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Skor ESG (0-100)</label>
                  <input type="number" step="0.1" name="audit_score" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" placeholder="92.5" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Status Kelayakan</label>
                <select name="status" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500">
                  <option value="Terverifikasi">Terverifikasi (Passed)</option>
                  <option value="Dalam Proses">Dalam Proses (Review)</option>
                  <option value="Kedaluwarsa">Dicabut / Kedaluwarsa</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Tanggal Penerbitan Audit</label>
                <input type="date" name="audit_date" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" />
              </div>

              <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-2.5 px-4 rounded-md hover:bg-emerald-400 transition-colors text-sm mt-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                Simpan & Validasi Blockchain
              </button>
            </form>
          </div>
        </div>

        {/* Profiles Grid Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white font-space flex items-center gap-2">
            <Landmark size={18} className="text-emerald-400" />
            Registry Kepatuhan & Jejak Karbon Produsen
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record) => {
              const score = Number(record.audit_score);
              const eudrPass = score >= 80;
              const peatPass = score >= 70;
              const stdbPass = score >= 65;
              const carbonIntensity = Math.round(150 - (score * 0.45));

              return (
                <div key={record.id} className="glass-panel p-5 rounded-xl border border-emerald-950 hover:border-emerald-500/35 transition flex flex-col justify-between space-y-4">
                  {/* Title & Standard */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                        {record.certification_type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        record.status === 'Terverifikasi' 
                          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' 
                          : record.status === 'Dalam Proses' 
                            ? 'border-lime-500/30 bg-lime-500/15 text-lime-300' 
                            : 'border-red-500/30 bg-red-500/15 text-red-300'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-white mt-2 font-space leading-tight">{record.company_name}</h4>
                    <p className="text-[10px] text-emerald-200/40 font-mono uppercase tracking-wider">
                      Audit: {new Date(record.audit_date).toLocaleDateString('id-ID', {year: 'numeric', month: 'long', day: 'numeric'})}
                    </p>
                  </div>

                  {/* ESG Score & Carbon Intensity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-200/50">Skor Audit ESG</span>
                      <span className="font-extrabold text-white">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-lime-400' : 'bg-red-400'}`} 
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-emerald-200/50">Intensitas Emisi TBS</span>
                      <span className="font-bold text-emerald-400 font-mono">{carbonIntensity} kg CO2e / Ton</span>
                    </div>
                  </div>

                  {/* Satellite Geofence Flags */}
                  <div className="border-t border-emerald-950/80 pt-3 text-[11px] space-y-1.5">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/60 mb-2">Simulasi Satelit & Geofence (EUDR)</p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200/60 flex items-center gap-1.5">
                        <Leaf size={11} className={eudrPass ? 'text-emerald-400' : 'text-yellow-500'} />
                        Bebas Deforestasi (EUDR)
                      </span>
                      <span className={`font-semibold ${eudrPass ? 'text-emerald-300 bg-emerald-500/10 px-1.5 rounded' : 'text-yellow-400 bg-yellow-500/10 px-1.5 rounded'}`}>
                        {eudrPass ? 'Pass' : 'Review'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200/60 flex items-center gap-1.5">
                        <Flame size={11} className={peatPass ? 'text-emerald-400' : 'text-yellow-500'} />
                        Proteksi Kawasan Gambut
                      </span>
                      <span className={`font-semibold ${peatPass ? 'text-emerald-300 bg-emerald-500/10 px-1.5 rounded' : 'text-yellow-400 bg-yellow-500/10 px-1.5 rounded'}`}>
                        {peatPass ? 'Pass' : 'Review'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200/60 flex items-center gap-1.5">
                        <Scale size={11} className={stdbPass ? 'text-emerald-400' : 'text-yellow-500'} />
                        Legalitas STDB Lahan
                      </span>
                      <span className={`font-semibold ${stdbPass ? 'text-emerald-300 bg-emerald-500/10 px-1.5 rounded' : 'text-yellow-400 bg-yellow-500/10 px-1.5 rounded'}`}>
                        {stdbPass ? 'Lengkap' : 'Review'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {records.length === 0 && (
              <div className="col-span-2 text-center py-10 text-sm text-emerald-200/55">
                Belum ada rekam audit kepatuhan terdaftar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
