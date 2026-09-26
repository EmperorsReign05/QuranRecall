import type { VerseKey as QuranVerseKey } from "@quranjs/api";

export type VerseKey = QuranVerseKey | `qunoot-${string}:${number}`;

export type MemoryState = "strong" | "review" | "weak" | "untracked";

export type DifficultyRating = 1 | 2 | 3;
// 1 = easy, 2 = medium, 3 = hard

export interface AyahEngagement {
  verseKey: VerseKey;
  surahNumber: number;
  ayahNumber: number;
  lastEngagedAt: Date | null;
  engagementCount: number;
  difficultyRating: DifficultyRating;
  userNotes?: string;
  lastRevisedAt: Date | null;
}

export interface DecayedAyah extends AyahEngagement {
  strengthScore: number;
  memoryState: MemoryState;
  daysSinceEngagement: number | null;
  revisionUrgency: number;
}

export interface SurahMeta {
  number: number;
  nameSimple: string;
  nameArabic: string;
  versesCount: number;
  translatedName: string;
}

export interface SurahGroup {
  surah: SurahMeta;
  ayahs: DecayedAyah[];
  surahStrength: number;
  trackedCount: number;
  strongCount: number;
  reviewCount: number;
  weakCount: number;
}

export interface RevisionQueueItem {
  ayah: DecayedAyah;
  surahName: string;
  estimatedSeconds: number;
  priority: "urgent" | "due" | "upcoming";
}

export interface HifdhStats {
  totalTracked: number;
  strongCount: number;
  reviewCount: number;
  weakCount: number;
  overallHealthScore: number;
}

export interface AyahContent {
  verseKey: VerseKey;
  arabicText: string;
  arabicIndoPakText?: string;
  translationText: string;
}
