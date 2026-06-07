import { Fingerprint } from 'lucide-react';
import IdentityGenerator from './identity-generator';

export const dynamic = 'force-dynamic';

export default function AdminIdentityPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          <Fingerprint size={14} />
          PODGE Sovereign QR Identity
        </div>
        <h1 className="mt-3 font-space text-3xl font-extrabold text-white">PODGE-ID Generator</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-200/60">
          Buat identitas QR universal tanpa email sebagai fondasi login PODGE generasi berikutnya.
          Public code menjadi username, private token menjadi kunci akses, dan recovery code disimpan hanya sekali.
        </p>
      </div>

      <IdentityGenerator />
    </div>
  );
}
