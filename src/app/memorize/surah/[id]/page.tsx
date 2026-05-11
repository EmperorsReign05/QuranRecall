import SurahSession from '@/components/memorization/SurahSession';
import { notFound } from 'next/navigation';

export default function MemorizeSurahPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const surahId = parseInt(id);

  if (isNaN(surahId)) {
    notFound();
    return null;
  }

  return <SurahSession surahNumber={surahId} />;
}
