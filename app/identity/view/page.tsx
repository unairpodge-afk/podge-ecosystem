import { Suspense } from 'react';
import IdentityViewClient from './identity-view-client';

export const dynamic = 'force-dynamic';

export default function IdentityViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040806] text-emerald-50">Memuat public PODGE-ID...</div>}>
      <IdentityViewClient />
    </Suspense>
  );
}
