import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export default async function GreenSukukPage() {
  // 1. MENGAMBIL DATA (READ)
  const dbResult = await query('SELECT * FROM green_sukuk_projects ORDER BY created_at DESC');
  const projects = dbResult.rows;

  // 2. SERVER ACTION UNTUK MENAMBAH DATA (CREATE)
  async function addProject(formData: FormData) {
    "use server"; // Petunjuk wajib bagi Next.js bahwa ini dijalankan di backend
    
    // Mengambil data dari input form
    const projectName = formData.get('project_name') as string;
    const location = formData.get('location') as string;
    const fundAllocated = Number(formData.get('fund_allocated'));
    const carbonTarget = Number(formData.get('carbon_target'));
    const status = formData.get('status') as string;

    // Eksekusi SQL Insert (Menggunakan $1, $2 untuk mencegah SQL Injection)
    await query(
      `INSERT INTO green_sukuk_projects (project_name, location, fund_allocated, carbon_target, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [projectName, location, fundAllocated, carbonTarget, status]
    );

    // Memuat ulang halaman agar tabel langsung menampilkan data baru
    revalidatePath('/value-creation/green-sukuk');
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Green Sukuk Portfolio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Instrumen Keuangan Syariah untuk Proyek Sawit Berkelanjutan
        </p>
      </div>

      {/* Form Input Tambah Proyek Baru */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tambah Proyek Baru</h2>
        
        {/* Atribut 'action' memanggil Server Action addProject */}
        <form action={addProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Nama Proyek</label>
            <input type="text" name="project_name" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: Biogas POME" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Lokasi Provinsi</label>
            <input type="text" name="location" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: Riau" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Alokasi Dana (Rp)</label>
            <input type="number" name="fund_allocated" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: 500000000" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Target Serapan Karbon (Ton CO₂)</label>
            <input type="number" step="0.1" name="carbon_target" required className="border border-gray-300 rounded-md p-2" placeholder="Misal: 150.5" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-600 mb-1">Status Proyek</label>
            <select name="status" className="border border-gray-300 rounded-md p-2 bg-white">
              <option value="Perencanaan">Perencanaan</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-2">
            <button type="submit" className="w-full bg-green-700 text-white font-medium py-2 px-4 rounded-md hover:bg-green-800 transition-colors">
              Simpan Proyek
            </button>
          </div>
        </form>
      </div>

      {/* Project Table Area (Menampilkan Data) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Daftar Proyek Terdanai</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Nama Proyek</th>
                <th className="px-6 py-3 font-medium">Lokasi</th>
                <th className="px-6 py-3 font-medium">Alokasi Dana (Rp)</th>
                <th className="px-6 py-3 font-medium">Target Karbon (Ton CO₂)</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.project_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Number(project.fund_allocated).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">{project.carbon_target}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Berjalan' ? 'bg-green-100 text-green-700' : 
                      project.status === 'Selesai' ? 'bg-blue-100 text-blue-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {projects.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              Belum ada data proyek.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}