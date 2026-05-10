import type {
  AyahEngagement,
  DecayedAyah,
  HifdhStats,
  MemoryState,
  RevisionQueueItem,
  SurahGroup,
  SurahMeta,
} from "@/types/hifdh";

export const DECAY_LAMBDA = 0.05;

export function daysSince(date: Date | null): number | null {
  if (!date) {
    return null;
  }

  const ms = Date.now() - date.getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24));
}

export function calculateStrengthScore(engagement: AyahEngagement): number {
  const days = daysSince(engagement.lastEngagedAt);

  if (days === null) {
    return 0;
  }

  const recencyScore = Math.exp(-DECAY_LAMBDA * days);
  const frequencyBoost = Math.min(
    Math.log(1 + engagement.engagementCount) / Math.log(21),
    1,
  );

  const difficultyWeight =
    engagement.difficultyRating === 1
      ? 1.1
      : engagement.difficultyRating === 3
        ? 0.8
        : 1;

  const raw = 0.65 * recencyScore + 0.35 * frequencyBoost;
  return Math.min(1, Math.max(0, raw * difficultyWeight));
}

export function getMemoryState(score: number): MemoryState {
  if (score === 0) {
    return "untracked";
  }

  if (score >= 0.7) {
    return "strong";
  }

  if (score >= 0.4) {
    return "review";
  }

  return "weak";
}

export function calculateRevisionUrgency(engagement: AyahEngagement): number {
  const score = calculateStrengthScore(engagement);

  if (score === 0) {
    return 0;
  }

  const days = daysSince(engagement.lastEngagedAt) ?? 0;
  const daysFactor = Math.min(days / 60, 1);

  return 0.7 * (1 - score) + 0.3 * daysFactor;
}

export function applyDecay(engagements: AyahEngagement[]): DecayedAyah[] {
  return engagements.map((engagement) => {
    const strengthScore = calculateStrengthScore(engagement);

    return {
      ...engagement,
      strengthScore,
      memoryState: getMemoryState(strengthScore),
      daysSinceEngagement: daysSince(engagement.lastEngagedAt),
      revisionUrgency: calculateRevisionUrgency(engagement),
    };
  });
}

export function groupBySurah(
  decayedAyahs: DecayedAyah[],
  surahMeta: SurahMeta[],
): SurahGroup[] {
  const metaMap = new Map(surahMeta.map((surah) => [surah.number, surah]));
  const grouped = new Map<number, DecayedAyah[]>();

  for (const ayah of decayedAyahs) {
    const existing = grouped.get(ayah.surahNumber) ?? [];
    existing.push(ayah);
    grouped.set(ayah.surahNumber, existing);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left - right)
    .flatMap(([surahNumber, ayahs]) => {
      const surah = metaMap.get(surahNumber);

      if (!surah) {
        return [];
      }

      const tracked = ayahs.filter((ayah) => ayah.memoryState !== "untracked");
      const strong = ayahs.filter((ayah) => ayah.memoryState === "strong");
      const review = ayahs.filter((ayah) => ayah.memoryState === "review");
      const weak = ayahs.filter((ayah) => ayah.memoryState === "weak");
      const avgStrength =
        tracked.length > 0
          ? tracked.reduce((sum, ayah) => sum + ayah.strengthScore, 0) / tracked.length
          : 0;

      return [
        {
          surah,
          ayahs: [...ayahs].sort((left, right) => left.ayahNumber - right.ayahNumber),
          surahStrength: avgStrength,
          trackedCount: tracked.length,
          strongCount: strong.length,
          reviewCount: review.length,
          weakCount: weak.length,
        },
      ];
    });
}

export function buildRevisionQueue(
  ayahs: DecayedAyah[],
  surahNames: Map<number, string>,
  limit = 10,
): RevisionQueueItem[] {
  const eligible = ayahs
    .filter((ayah) => ayah.memoryState !== "untracked")
    .sort((left, right) => right.revisionUrgency - left.revisionUrgency);

  const selected: DecayedAyah[] = [];
  const surahCounts = new Map<number, number>();

  // Pass 1: max 2 ayahs per surah
  for (const ayah of eligible) {
    if (selected.length >= limit) break;
    const count = surahCounts.get(ayah.surahNumber) ?? 0;
    if (count < 2) {
      selected.push(ayah);
      surahCounts.set(ayah.surahNumber, count + 1);
    }
  }

  // Pass 2: if limit not reached, allow up to 3 per surah
  if (selected.length < limit) {
    for (const ayah of eligible) {
      if (selected.length >= limit) break;
      if (selected.includes(ayah)) continue;
      const count = surahCounts.get(ayah.surahNumber) ?? 0;
      if (count < 3) {
        selected.push(ayah);
        surahCounts.set(ayah.surahNumber, count + 1);
      }
    }
  }

  // Pass 3: fallback to fill remaining slots regardless of surah
  if (selected.length < limit) {
    for (const ayah of eligible) {
      if (selected.length >= limit) break;
      if (!selected.includes(ayah)) {
        selected.push(ayah);
      }
    }
  }

  return selected.map((ayah) => ({
    ayah,
    surahName: surahNames.get(ayah.surahNumber) ?? `Surah ${ayah.surahNumber}`,
    estimatedSeconds:
      ayah.difficultyRating === 3 ? 45 : ayah.difficultyRating === 2 ? 30 : 20,
    priority:
      ayah.strengthScore < 0.3
        ? "urgent"
        : ayah.strengthScore < 0.65
          ? "due"
          : "upcoming",
  }));
}

export function calculateHifdhStats(ayahs: DecayedAyah[]): HifdhStats {
  const tracked = ayahs.filter((ayah) => ayah.memoryState !== "untracked");
  const strong = ayahs.filter((ayah) => ayah.memoryState === "strong");
  const review = ayahs.filter((ayah) => ayah.memoryState === "review");
  const weak = ayahs.filter((ayah) => ayah.memoryState === "weak");

  const overallHealthScore =
    tracked.length === 0
      ? 0
      : Math.round(
          (strong.length * 100 + review.length * 50 + weak.length * 10) /
            tracked.length,
        );

  return {
    totalTracked: tracked.length,
    strongCount: strong.length,
    reviewCount: review.length,
    weakCount: weak.length,
    overallHealthScore: Math.min(100, overallHealthScore),
  };
}
