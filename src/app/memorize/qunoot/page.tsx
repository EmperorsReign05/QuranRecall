import { Suspense } from 'react';
import DuaSession from '@/components/memorization/DuaSession';

export default function MemorizeDuaPage() {
  return (
    <Suspense fallback={null}>
      <DuaSession />
    </Suspense>
  );
}
