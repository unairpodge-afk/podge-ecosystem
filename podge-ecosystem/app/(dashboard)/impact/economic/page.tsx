export const metadata = {
  title: 'Economic Impact',
  description: 'Ringkasan dampak ekonomi untuk ekosistem sawit berkelanjutan.',
};

export default function EconomicImpactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Economic Impact</h1>
        <p className="text-sm text-gray-500 mt-1">
          Metrik ekonomi dan ikhtisar dampak untuk proyek berkelanjutan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Peningkatan Pendapatan Petani</p>
          <p className="mt-3 text-3xl font-bold text-green-700">+18%</p>
          <p className="mt-2 text-sm text-gray-500">Ditetapkan dari program traceability dan sertifikasi RSPO.</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Nilai Tambah Rantai Pasok</p>
          <p className="mt-3 text-3xl font-bold text-blue-700">Rp 220 M</p>
          <p className="mt-2 text-sm text-gray-500">Perkiraan peningkatan nilai akibat transparansi dan akses pembiayaan.</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pertumbuhan Investasi</p>
          <p className="mt-3 text-3xl font-bold text-indigo-700">+25%</p>
          <p className="mt-2 text-sm text-gray-500">Model financing hijau membantu membuka modal baru.</p>
        </div>
      </div>
    </div>
  );
}
