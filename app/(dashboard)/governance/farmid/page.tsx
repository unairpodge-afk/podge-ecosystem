import { Suspense } from 'react';
import FarmIdClient from './farmid-client';
import { getIdentitySession } from '@/lib/identity';

export const dynamic = 'force-dynamic';

export default async function FarmIdPage() {
  const identity = await getIdentitySession();
  const linkedFarmId = identity?.identity_type === 'farmer' ? identity.linked_farm_id : null;

  return (
    <Suspense fallback={<div className="text-sm text-emerald-200/60">Memuat FarmID...</div>}>
      <FarmIdClient initialLinkedFarmId={linkedFarmId} />
    </Suspense>
  );
}
