import { Sprout, Target, Map } from 'lucide-react';

export default function VisiMisi() {
  return (
    <section className="relative z-10 w-full border-t border-emerald-900/30 bg-[#020604] py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#040806] to-[#040806] pointer-events-none"></div>
      
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="mx-auto mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-emerald-400">
          <Target size={16} />
          Visi & Misi Ekosistem
        </div>
        
        <h2 className="mb-12 font-space text-3xl font-extrabold text-white md:text-5xl leading-tight">
          Fokus Utama: <br className="md:hidden" />
          <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent underline decoration-emerald-500/50 decoration-4 underline-offset-8 inline-block mt-2">
            KESEJAHTERAAN PETANI
          </span>
        </h2>

        <div className="grid gap-8 md:grid-cols-2 text-left">
          
          {/* Visi 1 */}
          <div className="glass-panel rounded-2xl border border-emerald-500/20 bg-black/40 p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] transition hover:border-emerald-500/40 flex flex-col justify-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <Sprout size={24} />
            </div>
            <h3 className="mb-3 font-space text-xl font-bold text-white">Kualitas & Pascapanen</h3>
            <p className="text-sm leading-relaxed text-emerald-100/70">
              Pengelolaan pascapanen yang memperhatikan kualitas produk TBS dan CPO, yang berkorelasi pada peruntukan penggunaan CPO untuk keperluan tertentu.
            </p>
          </div>

          {/* Visi 2 */}
          <div className="glass-panel rounded-2xl border border-emerald-500/20 bg-black/40 p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] transition hover:border-emerald-500/40">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <Map size={24} />
            </div>
            <h3 className="mb-3 font-space text-xl font-bold text-white">Panduan Teknis 12</h3>
            <div className="mb-3 inline-block rounded bg-emerald-950/60 px-2 py-1 border border-emerald-900/50">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">Topik Riset Prioritas 2026</p>
            </div>
            <p className="text-sm leading-relaxed text-emerald-100/70">
              <span className="text-emerald-300 font-bold mr-1">4.</span> Pengembangan metode penelusuran (traceability) hasil panen kelapa sawit yang terkait dengan sertifikasi ketertelusuran keberlanjutan produk turunan kelapa sawit di sepanjang rantai pasok industri sampai dengan transportasi, inventory, export, dan Konsumen akhir.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
