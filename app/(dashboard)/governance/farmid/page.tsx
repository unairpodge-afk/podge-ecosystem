import { Suspense } from 'react';
import FarmIdClient from './farmid-client';

export const dynamic = 'force-dynamic';

export default function FarmIdPage() {
  return (
    <Suspense fallback={<div className="text-sm text-emerald-200/60">Memuat FarmID...</div>}>
      <FarmIdClient />
    </Suspense>
  );
}
