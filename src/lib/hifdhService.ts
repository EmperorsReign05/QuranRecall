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
    // Removed automatic mock seeding for real users
  }

  getDashboardData(): DashboardData {
    const engagements = engagementStore.getAll();
    let decayedAyahs = applyDecay(engagements);

    if (typeof window !== "undefined") {
      const target = localStorage.getItem("hifdh_onboarding_target");
      if (engagements.length === 0 && target) {
        const surahNum = Number(target);
        const surah = SURAH_META_MAP.get(surahNum);
        if (surah) {
          const untrackedAyahs: DecayedAyah[] = Array.from({ length: surah.versesCount }).map((_, i) => ({
            verseKey: `${surah.number}:${i + 1}` as VerseKey,
            surahNumber: surah.number,
            ayahNumber: i + 1,
            engagementCount: 0,
            daysSinceEngagement: null,
            difficultyRating: 1,
            strengthScore: 0,
            memoryState: "untracked",
            revisionUrgency: 0,
            lastEngagedAt: null,
            lastRevisedAt: null
          }));
          decayedAyahs = [...decayedAyahs, ...untrackedAyahs];
        }
      }
    }

    console.log('decayed ayahs sample:', decayedAyahs.slice(0,3));
    console.log('non-untracked count:', decayedAyahs.filter(a => a.memoryState !== 'untracked').length);

    return {
      surahGroups: groupBySurah(decayedAyahs, SURAH_META),
      stats: calculateHifdhStats(decayedAyahs),
      revisionQueue: buildRevisionQueue(decayedAyahs, createSurahNameMap()),
    };
  }

  async recordReadingSession(verseKey: VerseKey): Promise<void> {
    try {
      await fetch('/api/user/reading-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseKey }),
      });
    } catch (e) {
      console.error('Failed to record reading session (fire and forget)', e);
    }
  }

  markRevised(verseKey: VerseKey): DashboardData {
    engagementStore.markRevised(verseKey);
    this.recordReadingSession(verseKey).catch(() => {});
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
