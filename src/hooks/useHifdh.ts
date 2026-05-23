"use client";

import { useEffect, useState } from "react";

import { hifdhService, type DashboardData } from "@/lib/hifdhService";
import { mapSessionsToEngagements, mergeWithLocalEngagements } from "@/lib/sessionMapper";
import { engagementStore } from "@/lib/engagementStore";
import { applyDecay, buildRevisionQueue, calculateHifdhStats, groupBySurah } from "@/lib/decay";
import { SURAH_META, SURAH_META_MAP } from "@/data/surahMeta";
import type {
  DifficultyRating,
  HifdhStats,
  RevisionQueueItem,
  SurahGroup,
  VerseKey,
} from "@/types/hifdh";
import type { UserStreak } from "@/lib/userApi";

type DataSource = "api" | "local" | "authenticated-empty";

type UseHifdhResult = {
  surahGroups: SurahGroup[];
  stats: HifdhStats | null;
  revisionQueue: RevisionQueueItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  currentStreak: number;
  longestStreak: number;
  dataSource: DataSource;
  markRevised: (verseKey: VerseKey) => void;
  setDifficulty: (verseKey: VerseKey, rating: DifficultyRating) => void;
  refreshData: () => void;
};

function emptyDashboard(): DashboardData {
  return {
    surahGroups: [],
    stats: {
      totalTracked: 0,
      strongCount: 0,
      reviewCount: 0,
      weakCount: 0,
      overallHealthScore: 0,
    },
    revisionQueue: [],
  };
}

function createSurahNameMap(): Map<number, string> {
  return new Map(
    Array.from(SURAH_META_MAP.values()).map((surah) => [surah.number, surah.nameSimple])
  );
}

function buildDashboardFromEngagements(engagements: ReturnType<typeof mergeWithLocalEngagements>): DashboardData {
  const decayed = applyDecay(engagements);
  return {
    surahGroups: groupBySurah(decayed, SURAH_META),
    stats: calculateHifdhStats(decayed),
    revisionQueue: buildRevisionQueue(decayed, createSurahNameMap()),
  };
}

export function useHifdh(): UseHifdhResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>("local");
  const [streaks, setStreaks] = useState<UserStreak>({ current_streak: 0, longest_streak: 0 });

  const refreshData = () => {
    setData(hifdhService.getDashboardData());
  };

  useEffect(() => {
    let isMounted = true;

    // Load local storage cache immediately to prevent flash of empty states
    const cachedData = hifdhService.getDashboardData();
    setData(cachedData);
    if (cachedData.stats && cachedData.stats.totalTracked > 0) {
      setIsLoading(false);
    }

    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (!isMounted) return;

        if (meData.isAuthenticated) {
          setIsAuthenticated(true);

          const sessionsRes = await fetch("/api/user/sessions");

          if (!sessionsRes.ok) throw new Error("sessions fetch failed");

          const { sessions, streaks: fetchedStreaks, error } = await sessionsRes.json() as {
            sessions: unknown[];
            streaks: UserStreak;
            error?: string;
          };

          if (!isMounted) return;

          if (error) {
            window.location.href = '/api/auth/login';
            return;
          }

          if (fetchedStreaks) setStreaks(fetchedStreaks);

          if (sessions.length > 0) {
            const apiEngagements = mapSessionsToEngagements(
              sessions as Parameters<typeof mapSessionsToEngagements>[0]
            );
            const localEngagements = engagementStore.getAll();
            const merged = mergeWithLocalEngagements(apiEngagements, localEngagements);
            engagementStore.bulkWrite(merged);
            setData(buildDashboardFromEngagements(merged));
            setDataSource("api");
          } else {
            setData(hifdhService.getDashboardData());
            setDataSource("authenticated-empty");
          }
        } else {
          setData(hifdhService.getDashboardData());
          setDataSource("local");
        }
      } catch {
        if (isMounted) {
          setData(hifdhService.getDashboardData());
          setDataSource("local");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const markRevised = (verseKey: VerseKey): void => {
    setData(hifdhService.markRevised(verseKey));
  };

  const setDifficulty = (verseKey: VerseKey, rating: DifficultyRating): void => {
    setData(hifdhService.setDifficulty(verseKey, rating));
  };

  const resolvedData = data ?? emptyDashboard();

  return {
    surahGroups: resolvedData.surahGroups,
    stats: data?.stats ?? null,
    revisionQueue: resolvedData.revisionQueue,
    isLoading,
    isAuthenticated,
    currentStreak: streaks.current_streak,
    longestStreak: streaks.longest_streak,
    dataSource,
    markRevised,
    setDifficulty,
    refreshData,
  };
}
