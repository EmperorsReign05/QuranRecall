import MemorizationSession from '@/components/memorization/MemorizationSession';
import { notFound } from 'next/navigation';
import type { VerseKey } from '@/types/hifdh';

export default async function MemorizeAyahPage({ params }: { params: Promise<{ verseKey: string }> }) {
  const { verseKey } = await params;
  // Simple validation of verseKey format
  if (!/^\d+:\d+$/.test(verseKey)) {
    notFound();
    return null;
  }
  // Retrieve surah name via SURAH_META_MAP (client side)
  return <MemorizationSession verseKey={verseKey as VerseKey} />;
}
