import { Target, BookOpen, ClipboardCheck, Users, Building2, Eye } from 'lucide-react';

export default function VisiMisi() {
  return (
    <section className="relative z-10 w-full border-t border-emerald-900/30 bg-[#020604] py-24">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/15 via-[#020604] to-[#020604] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header Tag */}
        <div className="text-center mb-16">
          <div className="mx-auto mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Target size={14} className="animate-pulse" />
            Visi & Misi Ekosistem
          </div>
          
          <h2 className="font-space text-3xl font-extrabold text-white md:text-5xl leading-tight">
            Fokus Utama: <br className="md:hidden" />
            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-200 bg-clip-text text-transparent underline decoration-emerald-500/50 decoration-4 underline-offset-8 inline-block mt-2">
              KESEJAHTERAAN PETANI
            </span>
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-10 lg:grid-cols-12 items-stretch">
          
          {/* Left Column: Research Priorities (BPDPKS Focus) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-6 h-full justify-between">
              
              {/* Research Card 1: Kualitas & Pascapanen */}
              <div className="group glass-panel rounded-2xl border border-emerald-500/15 bg-black/45 p-8 transition-all duration-300 hover:border-emerald-500/30 hover:bg-black/60 shadow-[0_0_30px_rgba(16,185,129,0.02)] flex flex-col md:flex-row gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <ClipboardCheck size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-space text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Kualitas & Pascapanen
                  </h3>
                  <p className="text-sm leading-relaxed text-emerald-100/70">
                    Pengelolaan pascapanen yang memperhatikan kualitas produk TBS (Tandan Buah Segar) dan CPO (Crude Palm Oil), yang berkorelasi pada peruntukan penggunaan CPO untuk keperluan tertentu.
                  </p>
                </div>
              </div>

              {/* Research Card 2: Panduan Teknis 12 (Traceability) */}
              <div className="group glass-panel rounded-2xl border border-blue-500/15 bg-black/45 p-8 transition-all duration-300 hover:border-blue-500/30 hover:bg-black/60 shadow-[0_0_30px_rgba(59,130,246,0.02)] flex flex-col md:flex-row gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-space text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      Traceability Rantai Pasok
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-blue-400/80">Topik Riset Prioritas 2026</p>
                  <p className="text-sm leading-relaxed text-emerald-100/70">
                    4. Pengembangan metode penelusuran (traceability) hasil panen kelapa sawit yang terkait dengan sertifikasi ketertelusuran keberlanjutan produk turunan kelapa sawit di sepanjang rantai pasok industri sampai dengan transportasi, inventory, export, dan Konsumen akhir.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Live Ecosystem Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            
            {/* Stat Card 1: Farmers Joined */}
            <div className="group glass-panel rounded-2xl border border-emerald-500/15 bg-black/45 p-6 hover:border-emerald-500/35 transition-all duration-300 flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:bg-emerald-500/20 transition-all">
                <Users size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-space text-3xl font-extrabold text-white">100</span>
                  <span className="text-sm font-semibold text-emerald-400">Petani</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-emerald-400/80">Telah Bergabung</p>
                <p className="text-xs text-emerald-100/60">
                  100 petani telah bergabung dan tersertifikasi FarmID dalam ekosistem.
                </p>
              </div>
            </div>

            {/* Stat Card 2: PKS Partners */}
            <div className="group glass-panel rounded-2xl border border-blue-500/15 bg-black/45 p-6 hover:border-blue-500/35 transition-all duration-300 flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner group-hover:bg-blue-500/20 transition-all">
                <Building2 size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-space text-3xl font-extrabold text-white">3</span>
                  <span className="text-sm font-semibold text-blue-400">PKS Mitra</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-blue-400/80">Telah Terdaftar</p>
                <p className="text-xs text-emerald-100/60">
                  3 PKS telah terdaftar sebagai mitra PODGE untuk verifikasi traceability CPO.
                </p>
              </div>
            </div>

            {/* Stat Card 3: Community Surveillance */}
            <div className="group glass-panel rounded-2xl border border-purple-500/15 bg-black/45 p-6 hover:border-purple-500/35 transition-all duration-300 flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner group-hover:bg-purple-500/20 transition-all">
                <Eye size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-space text-3xl font-extrabold text-white">100</span>
                  <span className="text-sm font-semibold text-purple-400">Warga</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-purple-400/80">Surveillance</p>
                <p className="text-xs text-emerald-100/60">
                  100 masyarakat telah memberi masukan surveillance dan pengawasan lingkungan.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
