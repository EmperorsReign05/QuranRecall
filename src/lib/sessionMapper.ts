import type { AyahEngagement, VerseKey } from "@/types/hifdh";

// API returns { chapterNumber, verseNumber } — no verse_key field
type RawSession = {
  id?: string;
  chapterNumber?: number;
  verseNumber?: number;
  verse_key?: string;
  verseKey?: string;
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
};

function getVerseKey(session: RawSession): string | null {
  if (session.verse_key) return session.verse_key;
  if (session.verseKey) return session.verseKey;
  if (session.chapterNumber != null && session.verseNumber != null) {
    return `${session.chapterNumber}:${session.verseNumber}`;
  }
  return null;
}

function getDate(session: RawSession): Date {
  const raw = session.updatedAt ?? session.updated_at ?? session.createdAt ?? session.created_at;
  return raw ? new Date(raw) : new Date();
}

export function mapSessionsToEngagements(
  sessions: RawSession[]
): AyahEngagement[] {
  const grouped = new Map<string, RawSession[]>();

  for (const session of sessions) {
    const key = getVerseKey(session);
    if (!key) {
      console.warn("Session missing identifiers:", JSON.stringify(session));
      continue;
    }
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(session);
  }

  const engagements: AyahEngagement[] = [];

  grouped.forEach((sessionList, verseKey) => {
    const sorted = [...sessionList].sort(
      (a, b) => getDate(b).getTime() - getDate(a).getTime()
    );

    const [surahValue, ayahValue] = verseKey.split(":");
    const surahNumber = parseInt(surahValue, 10);
    const ayahNumber = parseInt(ayahValue, 10);

    if (!Number.isFinite(surahNumber) || !Number.isFinite(ayahNumber)) return;

    engagements.push({
      verseKey: verseKey as VerseKey,
      surahNumber,
      ayahNumber,
      lastEngagedAt: getDate(sorted[0]),
      lastRevisedAt: getDate(sorted[0]),
      engagementCount: sessionList.length,
      difficultyRating: 2,
    });
  });

  return engagements;
}

export function mergeWithLocalEngagements(
  apiEngagements: AyahEngagement[],
  localEngagements: AyahEngagement[]
): AyahEngagement[] {
  const merged = new Map<string, AyahEngagement>();

  for (const eng of apiEngagements) {
    merged.set(eng.verseKey, eng);
  }

  for (const local of localEngagements) {
    const existing = merged.get(local.verseKey);
    if (existing) {
      const apiDate = existing.lastEngagedAt?.getTime() ?? 0;
      const localDate = local.lastEngagedAt?.getTime() ?? 0;
      merged.set(local.verseKey, {
        ...existing,
        difficultyRating: local.difficultyRating,
        lastEngagedAt: apiDate >= localDate ? existing.lastEngagedAt : local.lastEngagedAt,
        lastRevisedAt: apiDate >= localDate ? existing.lastRevisedAt : local.lastRevisedAt,
        engagementCount: existing.engagementCount + local.engagementCount,
        userNotes: local.userNotes ?? existing.userNotes,
      });
    } else {
      merged.set(local.verseKey, local);
    }
  }

  return Array.from(merged.values());
}
