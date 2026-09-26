import type { AyahEngagement, DifficultyRating, VerseKey } from "@/types/hifdh";

type SerializedAyahEngagement = Omit<
  AyahEngagement,
  "lastEngagedAt" | "lastRevisedAt"
> & {
  lastEngagedAt: string | null;
  lastRevisedAt: string | null;
};

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export class EngagementStore {
  private key = "hifdh_v1";

  private getStorage(): Storage | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage;
  }

  /** Convert Date fields to ISO strings for JSON storage. */
  private serialize(engagements: AyahEngagement[]): string {
    const serialized: SerializedAyahEngagement[] = engagements.map((engagement) => ({
      ...engagement,
      lastEngagedAt: engagement.lastEngagedAt?.toISOString() ?? null,
      lastRevisedAt: engagement.lastRevisedAt?.toISOString() ?? null,
    }));

    return JSON.stringify(serialized);
  }

  /** Convert stored ISO strings back to Date objects and tolerate malformed JSON. */
  private deserialize(json: string): AyahEngagement[] {
    try {
      const parsed = JSON.parse(json) as SerializedAyahEngagement[];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((engagement) => ({
        ...engagement,
        lastEngagedAt: parseDate(engagement.lastEngagedAt),
        lastRevisedAt: parseDate(engagement.lastRevisedAt),
      }));
    } catch {
      return [];
    }
  }

  private read(): AyahEngagement[] {
    const storage = this.getStorage();

    if (!storage) {
      return [];
    }

    const json = storage.getItem(this.key);
    return json ? this.deserialize(json) : [];
  }

  private write(engagements: AyahEngagement[]): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(this.key, this.serialize(engagements));
  }

  getAll(): AyahEngagement[] {
    return this.read();
  }

  bulkWrite(engagements: AyahEngagement[]): void {
    this.write(engagements);
  }

  get(verseKey: VerseKey): AyahEngagement | null {
    return this.read().find((engagement) => engagement.verseKey === verseKey) ?? null;
  }

  upsert(engagement: AyahEngagement): void {
    const engagements = this.read();
    const index = engagements.findIndex((item) => item.verseKey === engagement.verseKey);

    if (index >= 0) {
      engagements[index] = engagement;
    } else {
      engagements.push(engagement);
    }

    this.write(engagements);
  }

  markRevised(verseKey: VerseKey): void {
    const existing = this.get(verseKey);

    if (!existing) {
      return;
    }

    const now = new Date();

    this.upsert({
      ...existing,
      lastRevisedAt: now,
      lastEngagedAt: now,
      engagementCount: existing.engagementCount + 1,
    });
  }

  setDifficulty(verseKey: VerseKey, rating: DifficultyRating): void {
    const existing = this.get(verseKey);

    if (!existing) {
      return;
    }

    this.upsert({
      ...existing,
      difficultyRating: rating,
    });
  }

  declareMemorized(
    verseKeys: VerseKey[],
    lastReviewedDaysAgo: number,
    difficulty: DifficultyRating,
  ): void {
    const lastReviewedAt = new Date(
      Date.now() - lastReviewedDaysAgo * 24 * 60 * 60 * 1000,
    );
    const byVerseKey = new Map(
      this.read().map((engagement) => [engagement.verseKey, engagement]),
    );

    for (const verseKey of verseKeys) {
      let surahNumber: number;
      let ayahNumber: number;

      if (verseKey.startsWith("qunoot-")) {
        surahNumber = 999;
        const [, partStr] = verseKey.split(":");
        ayahNumber = Number(partStr);
      } else {
        const [surahValue, ayahValue] = verseKey.split(":");
        surahNumber = Number(surahValue);
        ayahNumber = Number(ayahValue);
      }

      const existing = byVerseKey.get(verseKey);

      if (!Number.isFinite(surahNumber) || !Number.isFinite(ayahNumber)) {
        continue;
      }

      byVerseKey.set(verseKey, {
        verseKey,
        surahNumber,
        ayahNumber,
        lastEngagedAt: lastReviewedAt,
        lastRevisedAt: lastReviewedAt,
        engagementCount: Math.max(existing?.engagementCount ?? 0, 1),
        difficultyRating: difficulty,
        userNotes: existing?.userNotes,
      });
    }

    this.write(Array.from(byVerseKey.values()));
  }

  seedIfEmpty(mockData: AyahEngagement[]): void {
    if (this.isEmpty()) {
      this.write(mockData);
    }
  }

  clear(): void {
    this.getStorage()?.removeItem(this.key);
  }

  isEmpty(): boolean {
    return this.read().length === 0;
  }
}

export const engagementStore = new EngagementStore();
