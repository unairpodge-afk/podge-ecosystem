import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Coins, Leaf, Landmark, Calendar, Percent, ShieldCheck } from 'lucide-react';

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
      {/* Header */}
      <div>
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          Green Financing Portal
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-emerald-50 font-space">Green Sukuk Portfolio</h1>
        <p className="text-sm text-emerald-200/60 mt-1">
          Instrumen Keuangan Syariah untuk Pendanaan Transisi Energi (Biogas POME) dan Peremajaan Sawit Rakyat (PSR).
        </p>
      </div>

      {/* Industrial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Dana Disalurkan', value: 'Rp 4.2 Triliun', note: '+12% Pertumbuhan Kuartal', icon: Landmark },
          { label: 'Rata-Rata Imbal Hasil (Nisbah)', value: '7.5% per Annum', note: 'Prinsip Mudharabah / Wakalah', icon: Percent },
          { label: 'Total Carbon Credits Terbit', value: '850k Ton CO2e', note: 'Terdaftar di Registry Karbon', icon: Leaf },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="glass-panel rounded-xl p-6 border border-emerald-500/10 flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-xs text-emerald-200/65 font-mono uppercase tracking-wider">{metric.label}</p>
                <p className="text-3xl font-extrabold text-emerald-50 font-space">{metric.value}</p>
                <span className="inline-block rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-mono text-emerald-400">
                  {metric.note}
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-xl border border-emerald-500/10 sticky top-6">
            <h2 className="text-lg font-semibold text-emerald-50 mb-4 flex items-center font-space">
              <Coins size={18} className="mr-2 text-emerald-400" /> Terbitkan Sukuk Baru
            </h2>
            <form action={addProject} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Nama Proyek Dekarbonisasi</label>
                <select name="project_name" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500">
                  <option value="Methane Capture Biogas POME">Methane Capture Biogas POME</option>
                  <option value="Peremajaan Sawit Rakyat (Replanting)">Peremajaan Sawit Rakyat (Replanting)</option>
                  <option value="Composting Unit & Organic Fertilizer">Composting Unit & Organic Fertilizer</option>
                  <option value="Biomass Boiler Electrification">Biomass Boiler Electrification</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Lokasi Kebun / PKS (Provinsi)</label>
                <input type="text" name="location" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" placeholder="Misal: Riau" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Alokasi Dana (Rp)</label>
                  <input type="number" name="fund_allocated" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" placeholder="Misal: 15000000000" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Target CO2 (Ton/Thn)</label>
                  <input type="number" step="0.1" name="carbon_target" required className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500" placeholder="Misal: 12500" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-emerald-200/70 mb-1 font-mono uppercase">Status Pendanaan</label>
                <select name="status" className="border border-emerald-900/70 bg-black/40 text-emerald-50 rounded-md p-2 text-sm outline-none transition focus:border-emerald-500">
                  <option value="Perencanaan">Masa Penawaran (Bookbuilding)</option>
                  <option value="Berjalan">Konstruksi / Berjalan (Active)</option>
                  <option value="Selesai">Terdanai Penuh (Completed)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-2.5 px-4 rounded-md hover:bg-emerald-400 transition-colors text-sm mt-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                Terbitkan Instrumen Sukuk
              </button>
            </form>
          </div>
        </div>

        {/* Investment Listings Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white font-space flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            Daftar Portofolio Investasi Syariah Hijau
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const fund = Number(project.fund_allocated);
              const carbon = Number(project.carbon_target);
              
              // Financial rules of thumb based on funding scale
              let tenor = '3 Tahun';
              let nisbah = '6.8%';
              if (fund >= 100000000000) {
                tenor = '7 Tahun';
                nisbah = '8.2%';
              } else if (fund >= 25000000000) {
                tenor = '5 Tahun';
                nisbah = '7.5%';
              }

              return (
                <div key={project.id} className="glass-panel p-5 rounded-xl border border-emerald-950 hover:border-emerald-500/35 transition flex flex-col justify-between space-y-4">
                  {/* Title & Location */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={11} /> {tenor} Tenor
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        project.status === 'Berjalan'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : project.status === 'Selesai'
                            ? 'border-green-500/30 bg-green-500/10 text-green-300'
                            : 'border-lime-500/30 bg-lime-500/10 text-lime-300'
                      }`}>
                        {project.status === 'Berjalan' ? 'Aktif Berjalan' : project.status === 'Selesai' ? 'Lunas / Terdanai' : 'Penawaran'}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-white mt-2 font-space leading-snug">{project.project_name}</h4>
                    <p className="text-xs text-emerald-200/50">Lokasi: Provinsi {project.location}</p>
                  </div>

                  {/* Financials & Carbon */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-950/60">
                    <div>
                      <span className="text-[9px] text-emerald-200/40 font-mono block uppercase">IMBAL HASIL (NISBAH)</span>
                      <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{nisbah} p.a.</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-200/40 font-mono block uppercase">CARBON OFFSET / THN</span>
                      <span className="text-sm font-extrabold text-white mt-1 block">{carbon.toLocaleString('id-ID')} tCO2e</span>
                    </div>
                  </div>

                  {/* Funding amount */}
                  <div className="p-3 bg-black/40 rounded-lg border border-emerald-950/80 flex items-center justify-between text-xs">
                    <span className="text-emerald-200/50">Nilai Emisi Sukuk:</span>
                    <span className="font-bold text-white">Rp {fund.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="col-span-2 text-center py-10 text-sm text-emerald-200/55">
                Belum ada instrumen Green Sukuk terbit.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
