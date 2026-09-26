import { NextResponse, NextRequest } from 'next/server';
import { fetchAyahContent, QuranApiError } from '@/lib/quranContentApi';
import type { VerseKey } from '@/types/hifdh';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ verseKey: string }> }
) {
  const resolvedParams = await params;
  const verseKey = resolvedParams.verseKey;

  if (!verseKey || (!/^\d+:\d+$/.test(verseKey) && !/^qunoot-v[12]:\d+$/.test(verseKey))) {
    return NextResponse.json({ error: 'Invalid verse key' }, { status: 400 });
  }

  if (verseKey.startsWith('qunoot-')) {
    const { DUA_QUNOOT_VERSIONS } = await import('@/data/duaQunoot');
    const [versionId, partNumStr] = verseKey.split(':');
    const vId = versionId.replace('qunoot-', '');
    const version = DUA_QUNOOT_VERSIONS[vId];
    
    if (!version) {
      return NextResponse.json({ error: 'Dua version not found' }, { status: 404 });
    }

    const partNum = parseInt(partNumStr, 10);
    const part = version.parts[partNum - 1];

    if (!part) {
      return NextResponse.json({ error: 'Dua part not found' }, { status: 404 });
    }

    const content = {
      verseKey: verseKey as VerseKey,
      arabicText: part.arabicText,
      arabicIndoPakText: part.arabicText,
      translationText: part.translationText,
    };

    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }

  try {
    const content = await fetchAyahContent(verseKey as VerseKey);
    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    if (error instanceof QuranApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
