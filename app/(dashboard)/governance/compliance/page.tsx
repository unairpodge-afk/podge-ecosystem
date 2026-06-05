import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default async function CompliancePage() {
  // 1. Mengambil data audit dari database
  let records = [];
  try {
    const dbResult = await query('SELECT * FROM compliance_evaluations ORDER BY audit_date DESC');
    records = dbResult.rows;
  } catch (e) {
    console.error('Gagal mengambil data compliance_evaluations:', e);
  }


  // 2. Server Action untuk input data audit baru
  async function addEvaluation(formData: FormData) {
    "use server";

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
        <h1 className="text-2xl font-bold text-gray-900">ESG & Compliance Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pemantauan Sertifikasi ISPO/RSPO dan Penilaian Tata Kelola Lingkungan Berkelanjutan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Input Data */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText size={18} className="mr-2 text-emerald-600" /> Catat Hasil Audit
            </h2>
            <form action={addEvaluation} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Nama Entitas / Perusahaan</label>
                <input type="text" name="company_name" required className="border border-gray-300 rounded-md p-2 text-sm" placeholder="PT / Koperasi..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Standar</label>
                  <select name="certification_type" className="border border-gray-300 rounded-md p-2 text-sm bg-white">
                    <option value="ISPO">ISPO</option>
                    <option value="RSPO">RSPO</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Skor Audit</label>
                  <input type="number" step="0.1" name="audit_score" required className="border border-gray-300 rounded-md p-2 text-sm" placeholder="0 - 100" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Status Sertifikasi</label>
                <select name="status" className="border border-gray-300 rounded-md p-2 text-sm bg-white">
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Kedaluwarsa">Kedaluwarsa / Dicabut</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Tanggal Audit</label>
                <input type="date" name="audit_date" required className="border border-gray-300 rounded-md p-2 text-sm" />
              </div>

              <button type="submit" className="w-full bg-slate-800 text-white font-medium py-2.5 px-4 rounded-md hover:bg-slate-900 transition-colors text-sm mt-2">
                Simpan Rekam Audit
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Tabel Monitoring */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Daftar Status Kepatuhan (Compliance Ledger)</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase bg-white">
                    <th className="px-6 py-4 font-medium">Entitas</th>
                    <th className="px-6 py-4 font-medium">Sertifikasi</th>
                    <th className="px-6 py-4 font-medium">Skor ESG</th>
                    <th className="px-6 py-4 font-medium">Status Kepatuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {record.company_name}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">Audit: {new Date(record.audit_date).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          {record.certification_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${Number(record.audit_score) >= 80 ? 'bg-emerald-500' : Number(record.audit_score) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${record.audit_score}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-slate-700">{record.audit_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                          ${record.status === 'Terverifikasi' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            record.status === 'Dalam Proses' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-red-50 text-red-700 border-red-200'}`}
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