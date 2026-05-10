import { MOCK_ENGAGEMENTS } from "@/data/mockEngagements";
import { SURAH_META, SURAH_META_MAP } from "@/data/surahMeta";
import { applyDecay, buildRevisionQueue, calculateHifdhStats, groupBySurah } from "@/lib/decay";
import { engagementStore } from "@/lib/engagementStore";
import type {
  DecayedAyah,
  DifficultyRating,
  HifdhStats,
  RevisionQueueItem,
  SurahGroup,
  VerseKey,
} from "@/types/hifdh";

export interface DashboardData {
  surahGroups: SurahGroup[];
  stats: HifdhStats;
  revisionQueue: RevisionQueueItem[];
}

function createSurahNameMap(): Map<number, string> {
  return new Map(
    Array.from(SURAH_META_MAP.values()).map((surah) => [surah.number, surah.nameSimple]),
  );
}

class HifdhService {
  init(): void {
    engagementStore.seedIfEmpty(MOCK_ENGAGEMENTS);
  }

  getDashboardData(): DashboardData {
    const engagements = engagementStore.getAll();
    const decayedAyahs = applyDecay(engagements);

    console.log('decayed ayahs sample:', decayedAyahs.slice(0,3));
    console.log('non-untracked count:', decayedAyahs.filter(a => a.memoryState !== 'untracked').length);

    return {
      surahGroups: groupBySurah(decayedAyahs, SURAH_META),
      stats: calculateHifdhStats(decayedAyahs),
      revisionQueue: buildRevisionQueue(decayedAyahs, createSurahNameMap()),
    };
  }

  markRevised(verseKey: VerseKey): DashboardData {
    engagementStore.markRevised(verseKey);
    return this.getDashboardData();
  }

  setDifficulty(verseKey: VerseKey, rating: DifficultyRating): DashboardData {
    engagementStore.setDifficulty(verseKey, rating);
    return this.getDashboardData();
  }

  getDecayedAyah(verseKey: VerseKey): DecayedAyah | null {
    const engagement = engagementStore.get(verseKey);

    if (!engagement) {
      return null;
    }

    return applyDecay([engagement])[0] ?? null;
  }
}

export const hifdhService = new HifdhService();
