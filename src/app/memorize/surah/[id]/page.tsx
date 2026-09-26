import { Suspense } from 'react';
import SurahSession from '@/components/memorization/SurahSession';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SURAH_META_MAP } from '@/data/surahMeta';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const surahId = parseInt(id);
  const surah = SURAH_META_MAP.get(surahId);

  if (!surah) {
    return { title: 'Surah Not Found | Quran Recall' };
  }

  const title = `Memorize Surah ${surah.nameSimple} | Quran Recall`;
  const description = `Join me in memorizing Surah ${surah.nameSimple} (${surah.translatedName}) using the growing window spaced repetition method.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Quran Recall',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function MemorizeSurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surahId = parseInt(id);

  if (isNaN(surahId)) {
    notFound();
    return null;
  }

  return (
    <Suspense fallback={null}>
      <SurahSession surahNumber={surahId} />
    </Suspense>
  );
}
