import type { AyahEngagement, VerseKey } from "@/types/hifdh";
import type { ReadingSession } from "@/lib/userApi";

export function mapSessionsToEngagements(
  sessions: ReadingSession[]
): AyahEngagement[] {
  const grouped = new Map<string, ReadingSession[]>();

  for (const session of sessions) {
    const key = session.verse_key;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(session);
  }

  const engagements: AyahEngagement[] = [];

  grouped.forEach((sessionList, verseKey) => {
    const sorted = [...sessionList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const [surahValue, ayahValue] = verseKey.split(":");
    const surahNumber = parseInt(surahValue, 10);
    const ayahNumber = parseInt(ayahValue, 10);

    if (!Number.isFinite(surahNumber) || !Number.isFinite(ayahNumber)) return;

    const lastDate = new Date(sorted[0].created_at);

    engagements.push({
      verseKey: verseKey as VerseKey,
      surahNumber,
      ayahNumber,
      lastEngagedAt: lastDate,
      lastRevisedAt: lastDate,
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

  // Seed with API engagements first (source of truth for dates + counts)
  for (const eng of apiEngagements) {
    merged.set(eng.verseKey, eng);
  }

  // Merge local on top — preserve difficulty rating, combine counts
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
