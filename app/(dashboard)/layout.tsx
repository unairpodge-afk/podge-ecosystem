"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  Leaf, 
  Coins, 
  User 
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Fungsi pembantu untuk memberikan warna aktif pada menu yang sedang dibuka
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

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-68 bg-gradient-to-b from-green-950 to-green-900 text-white flex flex-col border-r border-green-800 shadow-xl">
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

        {/* Navigation Menus */}
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
            <span>Ecosystem</span>
            <span>/</span>
            <span className="text-slate-800 capitalize font-semibold">
              {pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">Arva Athallah</p>
              <p className="text-xs text-slate-400 font-medium">Chief Researcher</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-tr from-green-600 to-emerald-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md border border-white">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}