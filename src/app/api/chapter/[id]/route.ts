import { NextResponse } from 'next/server';
import { fetchVersesByChapter, QuranApiError } from '@/lib/quranContentApi';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const idString = resolvedParams.id;

  const id = Number(idString);
  
  if (isNaN(id) || id < 1 || id > 114) {
    return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 });
  }

  try {
    const verses = await fetchVersesByChapter(id);
    return NextResponse.json({ verses }, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate'
      }
    });
  } catch (error) {
    if (error instanceof QuranApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
