export default function GreenSukukPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Green Sukuk Portfolio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Instrumen Keuangan Syariah untuk Proyek Sawit Berkelanjutan
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Dana Disalurkan</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">Rp 4.2 Triliun</p>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded mt-2 inline-block">
            +12% dari Kuartal Lalu
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Lahan Tervalidasi RSPO</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">124.500 Ha</p>
          <span className="text-xs text-gray-500 mt-2 inline-block">
            Terhubung via Analytics Layer
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Potensi Serapan Karbon</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">850k Ton CO₂e</p>
          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded mt-2 inline-block">
            Sesuai Metrik ESG
          </span>
        </div>
      </div>

      {/* Project Table Area (Placeholder untuk Data Layer) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Daftar Proyek Berkelanjutan</h2>
        </div>
        <div className="p-6 flex items-center justify-center h-48 bg-gray-50">
          <p className="text-gray-400 text-sm italic">
            Tabel SQL PostgreSQL akan dirender di sini melalui Prisma/Drizzle ORM.
          </p>
        </div>
      </div>
    </div>
  );
}