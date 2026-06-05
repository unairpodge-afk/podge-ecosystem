import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

type GreenSukukProject = {
  id: string | number;
  project_name: string;
  location: string;
  fund_allocated: number | string;
  carbon_target: number | string;
  status: string;
};

export default async function GreenSukukPage() {
  let projects: GreenSukukProject[] = [];

  try {
    const dbResult = await query<GreenSukukProject>('SELECT * FROM green_sukuk_projects ORDER BY created_at DESC');
    projects = dbResult.rows;
  } catch (e) {
    console.error('Gagal mengambil data green_sukuk_projects:', e);
  }

  async function addProject(formData: FormData) {
    'use server';

    const projectName = formData.get('project_name') as string;
    const location = formData.get('location') as string;
    const fundAllocated = Number(formData.get('fund_allocated'));
    const carbonTarget = Number(formData.get('carbon_target'));
    const status = formData.get('status') as string;

    await query(
      `INSERT INTO green_sukuk_projects (project_name, location, fund_allocated, carbon_target, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectName, location, fundAllocated, carbonTarget, status]
    );

    revalidatePath('/value-creation/green-sukuk');
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          Green Financing Portal
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">Green Sukuk Portfolio</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Instrumen Keuangan Syariah untuk Proyek Sawit Berkelanjutan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Dana Disalurkan', value: 'Rp 4.2 Triliun', note: '+12% dari Kuartal Lalu' },
          { label: 'Lahan Tervalidasi RSPO', value: '124.500 Ha', note: 'Terhubung via Analytics Layer' },
          { label: 'Potensi Serapan Karbon', value: '850k Ton CO2e', note: 'Sesuai Metrik ESG' },
        ].map((metric) => (
          <div key={metric.label} className="glass-panel rounded-lg p-6">
            <p className="text-sm text-emerald-200/65">{metric.label}</p>
            <p className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">{metric.value}</p>
            <p className="mt-3 inline-flex rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-mono text-emerald-400">
              {metric.note}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-emerald-50 mb-4 font-space">Tambah Proyek Baru</h2>

        <form action={addProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Nama Proyek</label>
            <input type="text" name="project_name" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: Biogas POME" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Lokasi Provinsi</label>
            <input type="text" name="location" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: Riau" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Alokasi Dana (Rp)</label>
            <input type="number" name="fund_allocated" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: 500000000" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-emerald-200/70 mb-1">Target Serapan Karbon (Ton CO2)</label>
            <input type="number" step="0.1" name="carbon_target" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500" placeholder="Misal: 150.5" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-emerald-200/70 mb-1">Status Proyek</label>
            <select name="status" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 outline-none transition focus:border-emerald-500">
              <option value="Perencanaan">Perencanaan</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-2">
            <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-2.5 px-4 rounded-md hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              Simpan Proyek
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-900/70 bg-black/20">
          <h2 className="text-lg font-semibold text-emerald-50 font-space">Daftar Proyek Terdanai</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-emerald-900/70 text-xs text-emerald-400 uppercase font-mono tracking-wider">
                <th className="px-6 py-3 font-medium">Nama Proyek</th>
                <th className="px-6 py-3 font-medium">Lokasi</th>
                <th className="px-6 py-3 font-medium">Alokasi Dana (Rp)</th>
                <th className="px-6 py-3 font-medium">Target Karbon (Ton CO2)</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-emerald-950/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-50">{project.project_name}</td>
                  <td className="px-6 py-4 text-sm text-emerald-200/60">{project.location}</td>
                  <td className="px-6 py-4 text-sm text-emerald-100">
                    {Number(project.fund_allocated).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-400 font-medium">{project.carbon_target}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      project.status === 'Berjalan'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : project.status === 'Selesai'
                          ? 'bg-green-500/15 text-green-300 border-green-500/30'
                          : 'bg-lime-500/15 text-lime-300 border-lime-500/30'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {projects.length === 0 && (
            <div className="p-6 text-center text-emerald-200/60 text-sm">
              Belum ada data proyek.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
