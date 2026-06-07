export default function AdminLoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Halaman ini digunakan untuk akses admin governance, audit, dan verifikasi identitas secara terpisah dari alur FarmID publik.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-green-900 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            Masuk sebagai Admin
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-green-50 p-6 text-sm text-gray-800">
        <p className="font-semibold text-gray-900">Kapan admin diperlukan?</p>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-gray-700">
          <li>Validasi onboarding petani dan farm baru.</li>
          <li>Pengawasan chain governance dan approval data yang sensitif.</li>
          <li>Menangani sengketa atau koreksi data setelah input petani.</li>
        </ul>
      </div>
    </div>
  );
}
