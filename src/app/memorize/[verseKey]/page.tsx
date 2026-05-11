import MemorizationSession from '@/components/memorization/MemorizationSession';
import { notFound } from 'next/navigation';

export default function MemorizeAyahPage({ params }: { params: { verseKey: string } }) {
  const { verseKey } = params;
  // Simple validation of verseKey format
  if (!/^\d+:\d+$/.test(verseKey)) {
    notFound();
    return null;
  }
  // Retrieve surah name via SURAH_META_MAP (client side)
  return <MemorizationSession verseKey={verseKey as any} />;
}
