"use client";

import { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { 
      category: "Main",
      items: [
        { name: "Overview Ecosystem", href: "/", icon: LayoutDashboard }
      ]
    },
    {
      category: "Governance Layer",
      items: [
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
      <div className="p-6 border-b border-green-800/50 bg-green-950/40">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-600 rounded-lg text-white shadow-md shadow-green-900/50">
            <Leaf size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-green-50">PODGE</h1>
            <p className="text-xs text-green-300 font-light">Digital Governance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-green-400 uppercase px-3 block opacity-70">
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
                      ? 'bg-green-600 text-white shadow-lg shadow-green-700/30 font-semibold translate-x-1'
                      : 'text-green-100 hover:bg-green-800/60 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-white' : 'text-green-300'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-green-800/60 bg-green-950/20 text-center">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-green-800/40 border border-green-700/50 text-[11px] text-green-200 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Local Node Engine Active</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <div className="md:flex md:min-h-screen">
        <aside className="hidden md:flex md:w-72 xl:w-80 bg-gradient-to-b from-green-950 to-green-900 text-white flex-col border-r border-green-800 shadow-xl">
        {renderMenu()}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 shadow-sm md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka navigasi"
            >
              <Menu size={18} />
            </button>
            <div className="text-sm text-slate-500 font-medium">
              <div className="flex flex-wrap items-center gap-2">
                <span>Ecosystem</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 capitalize font-semibold">{pageTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-700">Arva Athallah</p>
              <p className="text-xs text-slate-400 font-medium">Chief Researcher</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-md border border-white">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
      </div>
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-80 max-w-full bg-gradient-to-b from-green-950 to-green-900 text-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-green-800/60">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-600 rounded-lg text-white shadow-md shadow-green-900/50">
                  <Leaf size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wider text-green-50">PODGE</h1>
                  <p className="text-xs text-green-300 font-light">Mobile navigation</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/80 text-slate-100 transition hover:bg-slate-800"
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