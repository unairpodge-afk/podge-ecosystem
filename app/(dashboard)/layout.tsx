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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          if (data.user) {
            setUser(data.user);
          }
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
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Gagal keluar:', error);
    }
  }

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { 
      category: "Main",
      items: [
        { name: "Overview Dashboard", href: "/dashboard", icon: LayoutDashboard }
      ]
    },
    {
      category: "Governance Layer",
      items: [
        { name: "FarmID Claim", href: "/governance/farmid", icon: Fingerprint },
        { name: "Blockchain Traceability", href: "/governance/traceability", icon: Layers },
        { name: "Compliance Monitoring", href: "/governance/compliance", icon: ShieldCheck }
      ]
    },
    {
      category: "Value Creation",
      items: [
        { name: "Green Sukuk Portfolio", href: "/value-creation/green-sukuk", icon: Coins }
      ]
    },
    {
      category: "Impact Layer",
      items: [
        { name: "Economic Impact", href: "/impact/economic", icon: TrendingUp }
      ]
    }
  ];

  const pageTitle = pathname.split('/').pop()?.replace('-', ' ') || 'Overview';

  const renderMenu = () => (
    <>
      <div className="p-6 border-b border-emerald-900/50 bg-black/30">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="p-2 bg-emerald-500 rounded-lg text-black shadow-[0_0_20px_rgba(16,185,129,0.45)] transition group-hover:scale-105">
            <Leaf size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-emerald-50 font-space group-hover:text-emerald-400 transition-colors">PODGE</h1>
            <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Ecosystem Node v2.0</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
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
                      ? 'bg-emerald-500 text-black shadow-[0_0_22px_rgba(16,185,129,0.35)] font-semibold translate-x-1'
                      : 'text-emerald-100/80 hover:bg-emerald-950/70 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-black' : 'text-emerald-400'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

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
        <aside className="hidden md:flex md:w-72 xl:w-80 bg-[#06110b]/95 text-white flex-col border-r border-emerald-900/60 shadow-2xl shadow-black/60">
        {renderMenu()}
      </aside>

      {/* Main Content Area */}
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
                  <p className="text-[10px] text-emerald-400/80 font-mono">{identityTypeLabel(user.identity_type)}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg text-black flex items-center justify-center font-bold shadow-[0_0_18px_rgba(16,185,129,0.25)] border border-emerald-300/10 ${
                  user.identity_type === 'farmer' ? 'bg-emerald-500' : user.identity_type === 'company' ? 'bg-blue-500' : 'bg-amber-500'
                }`}>
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
              <Link
                href="/login"
                className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Masuk
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_34%),#040806]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
      </div>
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-80 max-w-full bg-[#06110b] text-white shadow-2xl border-r border-emerald-900/60">
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
      ) : null}
    </div>
  );
}
