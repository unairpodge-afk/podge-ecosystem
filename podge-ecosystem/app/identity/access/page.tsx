import Link from 'next/link';

export default function IdentityAccessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Identity Access</h1>
        <p className="mt-2 text-sm text-gray-600">
          Halaman ini menjelaskan bagaimana akses identitas dapat digunakan untuk memverifikasi petani, admin, dan masyarakat.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Fungsi utama</h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-700">
          <li>Menentukan siapa yang dapat memperbarui status FarmID.</li>
          <li>Menjaga pemisahan antara identity verification dan public tracking.</li>
          <li>Mendukung governance chain yang memerlukan akses terverifikasi.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-green-50 p-6 text-sm text-gray-800">
        <p className="font-semibold text-gray-900">Catatan integrasi</p>
        <p className="mt-2">
          Identity access idealnya digunakan untuk memastikan hanya petani resmi atau admin yang dapat melakukan perubahan kritis, sementara publik dapat melihat hasil traceability melalui barcode publik.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/identity/view" className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:border-gray-400">
          Lihat Identity View
        </Link>
        <Link href="/governance/farmid" className="rounded-xl bg-green-900 px-4 py-3 text-sm font-medium text-white hover:bg-green-800">
          Kembali ke FarmID
        </Link>
      </div>
    </div>
  );
}
