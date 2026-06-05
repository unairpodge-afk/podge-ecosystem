import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export default async function CompliancePage() {
  // 1. MENGAMBIL DATA KEPATUHAN (READ)
  let complianceRules = [];
  try {
    const dbResult = await query('SELECT * FROM compliance_rules ORDER BY category, code');
    complianceRules = dbResult.rows;
  } catch (e) {
    // Fallback Mock Data jika tabel compliance_rules belum ada di database
    complianceRules = [
      {
        id: 1,
        code: 'CR-001',
        title: 'Bebas Deforestasi (No Deforestation)',
        category: 'Environmental',
        threshold_value: '0% Deforestation sejak November 2018',
        actual_value: '99.8% Compliant (Terdeteksi Hutan Sekunder)',
        status: 'Warning'
      },
      {
        id: 2,
        code: 'CR-002',
        title: 'Penghindaran Lahan Gambut (No Peat)',
        category: 'Environmental',
        threshold_value: 'Bebas penanaman gambut baru',
        actual_value: '100% Compliant (Bebas Gambut)',
        status: 'Compliant'
      },
      {
        id: 3,
        code: 'CR-003',
        title: 'Sertifikasi RSPO Mitra Petani',
        category: 'Social & Legality',
        threshold_value: 'Minimal 80% petani bersertifikat',
        actual_value: '82.5% Petani Bersertifikat',
        status: 'Compliant'
      },
      {
        id: 4,
        code: 'CR-004',
        title: 'Umpan Balik Hak Ulayat (FPIC)',
        category: 'Social & Legality',
        threshold_value: '100% Persetujuan FPIC terdokumentasi',
        actual_value: 'Dalam Peninjauan Dokumen Adat',
        status: 'Non-Compliant'
      }
    ];
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pemantauan Kepatuhan Sawit Berkelanjutan (NDPE & RSPO) Terintegrasi Data Satelit & Audit
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Indikator</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{complianceRules.length}</p>
          <span className="text-xs text-slate-500 mt-2 inline-block">
            NDPE, RSPO & ISPO Standards
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status Lulus (Compliant)</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {complianceRules.filter(r => r.status === 'Compliant').length}
          </p>
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
            Memenuhi Syarat Audit
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Butuh Perhatian / Warning</h3>
          <p className="text-3xl font-bold text-amber-500 mt-2">
            {complianceRules.filter(r => r.status !== 'Compliant').length}
          </p>
          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">
            Tindakan Korektif Diperlukan
          </span>
        </div>
      </div>

      {/* Rules Table Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Indikator Kepatuhan</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Kode</th>
                <th className="px-6 py-3 font-medium">Nama Indikator</th>
                <th className="px-6 py-3 font-medium">Kategori</th>
                <th className="px-6 py-3 font-medium">Ambang Batas (Threshold)</th>
                <th className="px-6 py-3 font-medium">Kondisi Aktual</th>
                <th className="px-6 py-3 font-medium">Status Kepatuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {complianceRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{rule.code}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{rule.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                      {rule.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{rule.threshold_value}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{rule.actual_value}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      rule.status === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 
                      rule.status === 'Warning' ? 'bg-amber-100 text-amber-800' : 
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {rule.status}
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
