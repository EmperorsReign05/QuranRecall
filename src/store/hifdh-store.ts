import { create } from "zustand";

import { mockRevisionQueue } from "@/lib/mock-data";
import type { RevisionItem } from "@/types/hifdh";

type HifdhState = {
  revisionQueue: RevisionItem[];
  selectedSurahId: number | null;
  setSelectedSurahId: (surahId: number | null) => void;
};

export const useHifdhStore = create<HifdhState>((set) => ({
  revisionQueue: mockRevisionQueue,
  selectedSurahId: null,
  setSelectedSurahId: (surahId) => set({ selectedSurahId: surahId }),
}));
