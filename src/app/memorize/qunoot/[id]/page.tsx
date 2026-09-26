import DuaSession from '@/components/memorization/DuaSession';
import { notFound } from 'next/navigation';

export default async function MemorizeDuaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id !== 'v1' && id !== 'v2') {
    notFound();
    return null;
  }

  return <DuaSession duaId={id} />;
}
