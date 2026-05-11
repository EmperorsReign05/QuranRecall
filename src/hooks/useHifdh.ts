"use client";

import { useEffect, useState } from "react";

import { hifdhService, type DashboardData } from "@/lib/hifdhService";
import type {
  DifficultyRating,
  HifdhStats,
  RevisionQueueItem,
  SurahGroup,
  VerseKey,
} from "@/types/hifdh";

type UseHifdhResult = {
  surahGroups: SurahGroup[];
  stats: HifdhStats | null;
  revisionQueue: RevisionQueueItem[];
  isLoading: boolean;
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

export function useHifdh(): UseHifdhResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = () => {
    setData(hifdhService.getDashboardData());
  };

  useEffect(() => {
    refreshData();
    setIsLoading(false);
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
    markRevised,
    setDifficulty,
    refreshData,
  };
}
