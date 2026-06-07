import { Suspense } from 'react';
import IdentityAccessClient from './access-client';

export const dynamic = 'force-dynamic';

export default function IdentityAccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040806] text-emerald-50">Memuat PODGE-ID...</div>}>
      <IdentityAccessClient />
    </Suspense>
  );
}
