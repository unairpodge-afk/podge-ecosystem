import { query } from '@/lib/db';
import ComplianceClient from './compliance-client';

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
    const dbResult = await query<ComplianceRecord>(
      "SELECT * FROM compliance_evaluations WHERE company_name IN ('PT Borneo Palm Energy', 'PT Riau Agromakmur', 'PT Sumatera Palm Lestari') OR id > 3 ORDER BY audit_date DESC"
    );
    records = dbResult.rows;
  } catch (e) {
    console.error('Gagal mengambil data compliance_evaluations:', e);
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

      {/* Interactive Compliance Client (Modals, Click to view) */}
      <ComplianceClient initialRecords={records} />
    </div>
  );
}
