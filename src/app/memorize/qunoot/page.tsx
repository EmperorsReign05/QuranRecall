import { Suspense } from 'react';
import DuaSession from '@/components/memorization/DuaSession';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Memorize Dua Qunoot | Quran Recall',
  description: 'Join me in memorizing the Witr supplication (Dua Qunoot) using the growing window spaced repetition method.',
  openGraph: {
    title: 'Memorize Dua Qunoot | Quran Recall',
    description: 'Join me in memorizing the Witr supplication (Dua Qunoot) using the growing window spaced repetition method.',
    type: 'website',
    siteName: 'Quran Recall',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memorize Dua Qunoot | Quran Recall',
    description: 'Join me in memorizing the Witr supplication (Dua Qunoot) using the growing window spaced repetition method.',
  },
};

export default function MemorizeDuaPage() {
  return (
    <Suspense fallback={null}>
      <DuaSession />
    </Suspense>
  );
}
