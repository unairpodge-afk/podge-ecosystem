export default function IdentityViewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Identity View</h1>
        <p className="mt-2 text-sm text-gray-600">
          Halaman ini menampilkan ringkasan identitas yang dapat diakses publik setelah proses verifikasi atau pemeriksaan admin.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Data identitas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">Nama</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Petani Contoh</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">Status Verifikasi</p>
            <p className="mt-2 text-lg font-semibold text-green-700">Terverifikasi</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">Role</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Petani / Pengelola FarmID</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">Akses Publik</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Terbatas</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-blue-50 p-6 text-sm text-gray-800">
        <p className="font-semibold text-gray-900">Bagaimana ini bekerja</p>
        <p className="mt-2">
          Identitas dapat ditautkan ke FarmID dan verifikasi admin. Halaman ini menunjukkan bahwa hanya data yang tepat dan terverifikasi yang ditampilkan kepada publik.
        </p>
      </div>
    </div>
  );
}
