import type { VerseKey } from "@quranjs/api";

import { SURAH_META_MAP } from "@/data/surahMeta";
import type { AyahEngagement, DifficultyRating } from "@/types/hifdh";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function toVerseKey(surahNumber: number, ayahNumber: number): VerseKey {
  return `${surahNumber}:${ayahNumber}` as VerseKey;
}

function createEngagement(
  surahNumber: number,
  ayahNumber: number,
  days: number,
  engagementCount: number,
  difficultyRating: DifficultyRating,
): AyahEngagement {
  const engagedAt = daysAgo(days);

  return {
    verseKey: toVerseKey(surahNumber, ayahNumber),
    surahNumber,
    ayahNumber,
    lastEngagedAt: engagedAt,
    engagementCount,
    difficultyRating,
    lastRevisedAt: engagedAt,
  };
}

function addRange(
  target: AyahEngagement[],
  surahNumber: number,
  startAyah: number,
  endAyah: number,
  baseDays: number,
  baseCount: number,
  difficulties: DifficultyRating[],
): void {
  const surah = SURAH_META_MAP.get(surahNumber);

  if (!surah) {
    throw new Error(`Missing SurahMeta for surah ${surahNumber}`);
  }

  for (
    let ayahNumber = startAyah;
    ayahNumber <= Math.min(endAyah, surah.versesCount);
    ayahNumber += 1
  ) {
    const offset = ayahNumber - startAyah;
    const dayVariance = (offset % 5) - 2;
    const countVariance = (offset % 6) - 3;

    target.push(
      createEngagement(
        surahNumber,
        ayahNumber,
        Math.max(0, baseDays + dayVariance),
        Math.max(1, baseCount + countVariance),
        difficulties[offset % difficulties.length],
      ),
    );
  }
}

const engagements: AyahEngagement[] = [];

addRange(engagements, 1, 1, 7, 2, 22, [1]);
addRange(engagements, 2, 255, 255, 1, 30, [1]);
addRange(engagements, 18, 1, 10, 5, 15, [1, 1, 2]);
addRange(engagements, 36, 1, 25, 20, 8, [2, 2, 1]);
addRange(engagements, 36, 26, 50, 50, 4, [3, 2, 3]);

for (let surahNumber = 78; surahNumber <= 114; surahNumber += 1) {
  const surah = SURAH_META_MAP.get(surahNumber);

  if (!surah) {
    throw new Error(`Missing SurahMeta for surah ${surahNumber}`);
  }

  let baseDays = 12;
  let baseCount = 11;
  let difficulties: DifficultyRating[] = [1, 2];

  if ([112, 113, 114].includes(surahNumber)) {
    baseDays = 2;
    baseCount = 21;
    difficulties = [1];
  } else if ([110, 111, 109, 108].includes(surahNumber)) {
    baseDays = 8;
    baseCount = 14;
    difficulties = [1, 2];
  } else if ([88, 89, 90, 91].includes(surahNumber)) {
    baseDays = 19;
    baseCount = 8;
    difficulties = [2];
  } else if ([78, 79, 80, 81].includes(surahNumber)) {
    baseDays = 48;
    baseCount = 5;
    difficulties = [2, 3];
  } else if (surahNumber >= 92 && surahNumber <= 107) {
    baseDays = surahNumber % 2 === 0 ? 10 : 7;
    baseCount = surahNumber % 3 === 0 ? 13 : 16;
    difficulties = [1, 2];
  } else {
    baseDays = 14;
    baseCount = 10;
    difficulties = [1, 2];
  }

  addRange(
    engagements,
    surahNumber,
    1,
    surah.versesCount,
    baseDays,
    baseCount,
    difficulties,
  );
}

export const MOCK_ENGAGEMENTS: AyahEngagement[] = engagements;
