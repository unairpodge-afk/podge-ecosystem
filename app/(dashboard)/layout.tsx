"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Coins,
  User,
  Fingerprint,
  Menu,
  X,
  LogOut,
  Building2,
  Brain
} from 'lucide-react';

interface UserSession {
  display_name: string;
  public_code: string;
  identity_type: string;
}

function identityTypeLabel(type: string) {
  const labels: Record<string, string> = {
    farmer: 'Petani Mandiri',
    cooperative: 'Koperasi',
    mill: 'PKS / Pabrik',
    auditor: 'Auditor',
    admin: 'Admin',
    logistics: 'Logistik',
    finance: 'Keuangan',
    public_institution: 'Instansi Publik',
    company: 'Perusahaan',
    investor: 'Investor',
  };
  return labels[type] || type;
}

// ─── Role-aware menu configs ──────────────────────────────────────────────────

const farmerMenu = [
  {
    category: 'Beranda',
    items: [{ name: 'Overview Petani', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    category: 'Lahan & Identitas',
    items: [{ name: 'FarmID (Sertifikat Lahan)', href: '/governance/farmid', icon: Fingerprint }],
  },
  {
    category: 'Panen & Setoran',
    items: [{ name: 'Catat Kiriman TBS', href: '/governance/traceability', icon: Layers }],
  },
  {
    category: 'Dampak & Insentif',
    items: [{ name: 'Impact Ekonomi', href: '/impact/economic', icon: TrendingUp }],
  },
];

const companyMenu = [
  {
    category: 'Beranda',
    items: [{ name: 'Overview Perusahaan', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    category: 'Operasional PKS',
    items: [
      { name: 'Terima & Validasi TBS', href: '/governance/traceability', icon: Layers },
      { name: 'ESG & Kepatuhan ISPO', href: '/governance/compliance', icon: ShieldCheck },
    ],
  },
  {
    category: 'Keuangan Hijau',
    items: [{ name: 'Green Sukuk Portfolio', href: '/value-creation/green-sukuk', icon: Coins }],
  },
  {
    category: 'Analitik',
    items: [{ name: 'Impact Rantai Pasok', href: '/impact/economic', icon: TrendingUp }],
  },
];

const investorMenu = [
  {
    category: 'Beranda',
    items: [{ name: 'Portal Belajar Sawit', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    category: 'Edukasi',
    items: [{ name: 'Modul & Kuis', href: '/dashboard', icon: Brain }],
  },
  {
    category: 'Investasi',
    items: [{ name: 'Green Sukuk Portfolio', href: '/value-creation/green-sukuk', icon: Coins }],
  },
  {
    category: 'Data & Dampak',
    items: [{ name: 'ESG & Economic Impact', href: '/impact/economic', icon: TrendingUp }],
  },
];

// ─── Role accent colors ───────────────────────────────────────────────────────

interface RoleAccent {
  activeBg: string;
  activeText: string;
  activeShadow: string;
  hoverBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  labelBg: string;
}

function getRoleAccent(role: string): RoleAccent {
  if (role === 'farmer') {
    return {
      activeBg: 'bg-emerald-500',
      activeText: 'text-black',
      activeShadow: 'shadow-[0_0_22px_rgba(16,185,129,0.35)]',
      hoverBg: 'hover:bg-emerald-950/70',
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-400',
      badgeBorder: 'border-emerald-500/20',
      labelBg: 'bg-emerald-500',
    };
  }
  if (role === 'company') {
    return {
      activeBg: 'bg-blue-500',
      activeText: 'text-black',
      activeShadow: 'shadow-[0_0_22px_rgba(59,130,246,0.35)]',
      hoverBg: 'hover:bg-blue-950/70',
      iconColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10',
      badgeText: 'text-blue-400',
      badgeBorder: 'border-blue-500/20',
      labelBg: 'bg-blue-500',
    };
  }
  // investor / default
  return {
    activeBg: 'bg-amber-500',
    activeText: 'text-black',
    activeShadow: 'shadow-[0_0_22px_rgba(245,158,11,0.35)]',
    hoverBg: 'hover:bg-amber-950/70',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    labelBg: 'bg-amber-500',
  };
}

// ─── Layout Component ─────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/identity/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) setUser(data.user);
        }
      } catch (error) {
        console.error('Gagal memuat sesi:', error);
      } finally {
        setLoading(false);
      }
    }
    void checkSession();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch('/api/identity/logout', { method: 'POST' });
      if (response.ok) window.location.href = '/login';
    } catch (error) {
      console.error('Gagal keluar:', error);
    }
  }

  const isActive = (path: string) => pathname === path;

  const role = user?.identity_type || 'farmer';
  const menuItems = role === 'company' ? companyMenu : role === 'investor' ? investorMenu : farmerMenu;
  const accent = getRoleAccent(role);

  const pageTitle = pathname.split('/').pop()?.replace('-', ' ') || 'Overview';

  const renderMenu = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-emerald-900/50 bg-black/30">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className={`p-2 ${accent.labelBg} rounded-lg text-black shadow-[0_0_20px_rgba(16,185,129,0.45)] transition group-hover:scale-105`}>
            <Leaf size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-emerald-50 font-space group-hover:text-emerald-400 transition-colors">PODGE</h1>
            <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Ecosystem Node v2.0</p>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      {user && (
        <div className={`mx-4 mt-4 mb-1 px-3 py-2 rounded-xl ${accent.badgeBg} border ${accent.badgeBorder} flex items-center gap-2`}>
          <div className={`h-2 w-2 rounded-full ${accent.labelBg} animate-pulse`} />
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${accent.badgeText}`}>
            {identityTypeLabel(role)} — {user.display_name.split(' ')[0]}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto custom-scrollbar">
        {menuItems.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase px-3 block opacity-70 font-mono">
              {group.category}
            </span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? `${accent.activeBg} ${accent.activeText} ${accent.activeShadow} font-semibold translate-x-1`
                      : `text-emerald-100/80 ${accent.hoverBg} hover:text-white hover:translate-x-0.5`
                  }`}
                >
                  <Icon size={18} className={active ? accent.activeText : accent.iconColor} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer node status */}
      <div className="p-4 border-t border-emerald-900/60 bg-black/20 text-center">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-700/40 text-[11px] text-emerald-200 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Local Node Engine Active</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#040806] text-emerald-50 antialiased font-sans web3-grid">
      <div className="md:flex md:min-h-screen">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-72 xl:w-80 bg-[#06110b]/95 text-white flex-col border-r border-emerald-900/60 shadow-2xl shadow-black/60">
          {renderMenu()}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Top Header */}
          <header className="sticky top-0 z-20 bg-[#040806]/85 border-b border-emerald-900/50 flex items-center justify-between px-4 py-3 shadow-sm md:px-8 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-800/60 bg-emerald-950/50 text-emerald-100 shadow-sm transition hover:bg-emerald-900/60 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Buka navigasi"
              >
                <Menu size={18} />
              </button>
              <div className="text-sm text-emerald-300/70 font-medium">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Ecosystem</span>
                  <span className="text-emerald-800">/</span>
                  <span className="text-emerald-50 capitalize font-semibold">{pageTitle}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {loading ? (
                <div className="h-5 w-24 bg-emerald-900/20 animate-pulse rounded"></div>
              ) : user ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-50">{user.display_name}</p>
                    <p className={`text-[10px] font-mono ${accent.badgeText}`}>{identityTypeLabel(user.identity_type)}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg text-black flex items-center justify-center font-bold shadow-[0_0_18px_rgba(16,185,129,0.25)] border border-emerald-300/10 ${accent.labelBg}`}>
                    {user.identity_type === 'farmer' && <User size={18} />}
                    {user.identity_type === 'company' && <Building2 size={18} />}
                    {user.identity_type === 'investor' && <Coins size={18} />}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Keluar dari Sistem"
                    className="p-2 rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/20 hover:text-red-200 transition"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition">
                  Masuk
                </Link>
              )}
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_34%),#040806]">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-80 max-w-full bg-[#06110b] text-white shadow-2xl border-r border-emerald-900/60 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-900/60">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500 rounded-lg text-black shadow-[0_0_20px_rgba(16,185,129,0.45)]">
                  <Leaf size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wider text-emerald-50">PODGE</h1>
                  <p className="text-xs text-emerald-400 font-light">Mobile navigation</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/70 text-emerald-100 transition hover:bg-emerald-950"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup navigasi"
              >
                <X size={18} />
              </button>
            </div>
            {renderMenu()}
          </aside>
        </div>
      )}
    </div>
  );
}
