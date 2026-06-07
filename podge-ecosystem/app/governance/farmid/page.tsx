import Link from 'next/link';

export default function FarmIdPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Farm ID</h1>
        <p className="mt-2 text-sm text-gray-600">
          Dua barcode FarmID dibuat untuk memisahkan akses publik dan private: satu untuk petani, satu untuk masyarakat.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Barcode 1 (Private)</h2>
          <p className="mt-3 text-sm text-gray-600">
            Simpan barcode ini dengan aman. Ini adalah private FarmID yang digunakan petani untuk mengelola data farm dan memperbarui status panen.
          </p>
          <div className="mt-6 flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-green-500 bg-green-50 text-green-900">
            Barcode Private
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Barcode 2 (Publik)</h2>
          <p className="mt-3 text-sm text-gray-600">
            Bagikan barcode ini kepada masyarakat. Scan barcode ini untuk melihat informasi pelacakan petani dan hasil panen sawit.
          </p>
          <div className="mt-6 flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-50 text-blue-900">
            Barcode Publik
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Urutan Alur</h2>
        <ol className="mt-4 space-y-3 list-decimal pl-5 text-sm text-gray-700">
          <li>
            Petani menerima dua barcode FarmID.
          </li>
          <li>
            Simpan <strong>Barcode 1</strong> untuk penggunaan internal dan pembaruan status panen.
          </li>
          <li>
            Sebarkan <strong>Barcode 2</strong> ke masyarakat agar mereka dapat melacak data petani dan hasil panen sawit.
          </li>
          <li>
            Setelah input data panen, status panen akan muncul di dashboard petani serta dalam laporan traceability publik.
          </li>
        </ol>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-green-50 p-6 text-sm text-gray-800">
        <p className="font-semibold text-gray-900">Catatan penting</p>
        <p className="mt-2">
          Status publik FarmID dikelola langsung oleh petani melalui barcode private. Verifikasi admin untuk chain governance lain berjalan terpisah.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Jika ingin fungsi audit, otorisasi, atau approval terpusat, buat dashboard admin khusus. Namun public FarmID tetap bisa beroperasi tanpa verifikasi admin untuk setiap pembaruan status panen.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Langkah selanjutnya</h2>
        <p className="mt-3 text-sm text-gray-600">
          Gunakan halaman berikut untuk menguji integrasi:</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/login" className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800">
            Admin Login
          </Link>
          <Link href="/identity/access" className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 hover:border-gray-400">
            Identity Access
          </Link>
        </div>
      </div>
    </div>
  );
}
