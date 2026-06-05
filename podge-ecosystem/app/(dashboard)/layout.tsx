import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-green-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">PODGE</h1>
          <p className="text-sm text-green-200 mt-1">Palm Oil Digital Governance</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/governance/traceability" 
            className="block px-4 py-2 rounded hover:bg-green-800 transition-colors"
          >
            Blockchain Traceability
          </Link>
          <Link 
            href="/value-creation/green-sukuk" 
            className="block px-4 py-2 rounded hover:bg-green-800 transition-colors"
          >
            Green Sukuk & Financing
          </Link>
          <Link 
            href="/impact/economic" 
            className="block px-4 py-2 rounded hover:bg-green-800 transition-colors"
          >
            Economic Impact
          </Link>
        </nav>

        <div className="p-4 border-t border-green-800 text-xs text-green-300 text-center">
          v1.0.0 - Analytics Layer Active
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-medium text-gray-700">Dashboard Ecosystem</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">Admin</span>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center border border-green-300">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Page Content (Children) */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}