import SurahSession from '@/components/memorization/SurahSession';
import { notFound } from 'next/navigation';

export default async function MemorizeSurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surahId = parseInt(id);

  if (isNaN(surahId)) {
    notFound();
    return null;
  }

  return <SurahSession surahNumber={surahId} />;
}
