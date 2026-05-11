import { NextResponse, NextRequest } from 'next/server';
import { fetchAyahContent, QuranApiError } from '@/lib/quranContentApi';
import type { VerseKey } from '@/types/hifdh';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ verseKey: string }> }
) {
  const resolvedParams = await params;
  const verseKey = resolvedParams.verseKey;

  if (!verseKey || !/^\d+:\d+$/.test(verseKey)) {
    return NextResponse.json({ error: 'Invalid verse key' }, { status: 400 });
  }

  try {
    const content = await fetchAyahContent(verseKey as VerseKey);
    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate'
      }
    });
  } catch (error) {
    if (error instanceof QuranApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
