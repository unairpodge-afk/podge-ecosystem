export default function GreenSukukPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Green Sukuk Portfolio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Instrumen Keuangan Syariah untuk Proyek Sawit Berkelanjutan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Total Dana</h2>
          <p className="mt-3 text-3xl font-bold text-green-700">Rp 4,2T</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Kuota Sukuk</h2>
          <p className="mt-3 text-3xl font-bold text-blue-700">124.500 Ha</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Target Impact</h2>
          <p className="mt-3 text-3xl font-bold text-indigo-700">850k Ton CO₂e</p>
        </div>
      </div>
    </div>
  );
}
