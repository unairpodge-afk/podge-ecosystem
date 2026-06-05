import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

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
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          ESG Compliance Layer
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">ESG & Compliance Monitoring</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Pemantauan sertifikasi ISPO/RSPO dan penilaian tata kelola lingkungan berkelanjutan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-lg sticky top-6">
            <h2 className="text-lg font-semibold text-emerald-50 mb-4 flex items-center font-space">
              <FileText size={18} className="mr-2 text-emerald-400" /> Catat Hasil Audit
            </h2>
            <form action={addEvaluation} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm text-emerald-200/70 mb-1">Nama Entitas / Perusahaan</label>
                <input type="text" name="company_name" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" placeholder="PT / Koperasi..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-emerald-200/70 mb-1">Standar</label>
                  <select name="certification_type" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500">
                    <option value="ISPO">ISPO</option>
                    <option value="RSPO">RSPO</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-emerald-200/70 mb-1">Skor Audit</label>
                  <input type="number" step="0.1" name="audit_score" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" placeholder="0 - 100" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-emerald-200/70 mb-1">Status Sertifikasi</label>
                <select name="status" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500">
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Kedaluwarsa">Kedaluwarsa / Dicabut</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-emerald-200/70 mb-1">Tanggal Audit</label>
                <input type="date" name="audit_date" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" />
              </div>

              <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-2.5 px-4 rounded-md hover:bg-emerald-400 transition-colors text-sm mt-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                Simpan Rekam Audit
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-panel rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-900/70 bg-black/20">
              <h2 className="text-lg font-semibold text-emerald-50 font-space">Daftar Status Kepatuhan</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-900/70 text-xs text-emerald-400 uppercase font-mono tracking-wider">
                    <th className="px-6 py-4 font-medium">Entitas</th>
                    <th className="px-6 py-4 font-medium">Sertifikasi</th>
                    <th className="px-6 py-4 font-medium">Skor ESG</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/80 text-sm">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-emerald-950/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-emerald-50">
                        {record.company_name}
                        <div className="text-xs text-emerald-200/45 font-normal mt-0.5">Audit: {new Date(record.audit_date).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/25">
                          {record.certification_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-emerald-950 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${Number(record.audit_score) >= 80 ? 'bg-emerald-400' : Number(record.audit_score) >= 60 ? 'bg-lime-400' : 'bg-red-400'}`}
                              style={{ width: `${record.audit_score}%` }}
                            />
                          </div>
                          <span className="font-medium text-emerald-100">{record.audit_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                          ${record.status === 'Terverifikasi' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                            record.status === 'Dalam Proses' ? 'bg-lime-500/15 text-lime-300 border-lime-500/30' :
                            'bg-red-500/15 text-red-300 border-red-500/30'}`}
                        >
                          {record.status === 'Terverifikasi' && <CheckCircle size={12} className="mr-1.5" />}
                          {record.status === 'Dalam Proses' && <AlertTriangle size={12} className="mr-1.5" />}
                          {record.status === 'Kedaluwarsa' && <ShieldCheck size={12} className="mr-1.5" />}
                          {record.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
