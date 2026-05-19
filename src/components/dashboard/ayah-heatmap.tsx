"use client";

import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DecayedAyah, HifdhStats, SurahGroup, VerseKey } from "@/types/hifdh";

interface AyahHeatmapProps {
  surahGroups: SurahGroup[];
  stats: HifdhStats | null;
  isLoading: boolean;
  onSelectAyah?: (verseKey: VerseKey) => void;
  selectedAyah?: VerseKey | null;
  dataSource?: "api" | "local" | "authenticated-empty";
}

function SkeletonHeatmap() {
  return (
    <div className="space-y-4 animate-pulse">
      {[8, 3, 12, 6, 4, 9].map((count, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-[120px] flex-shrink-0 space-y-1">
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-14 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="flex flex-wrap gap-[3px]">
            {Array.from({ length: count }).map((_, squareIndex) => (
              <div
                key={squareIndex}
                className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-700"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getSelectedRingClass(isSelected: boolean) {
  return isSelected
    ? "ring-2 ring-zinc-900 ring-offset-1 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-950 z-10"
    : "";
}

function getAyahSquareClasses(ayah: DecayedAyah, isSelected: boolean) {
  let bgClass = "bg-zinc-200 dark:bg-zinc-800";

  if (ayah.memoryState === "strong") bgClass = "bg-emerald-500";
  else if (ayah.memoryState === "review") bgClass = "bg-amber-500";
  else if (ayah.memoryState === "weak") bgClass = "bg-red-500";

  let opacityClass = "opacity-100";

  if (
    ayah.memoryState !== "untracked" &&
    ayah.daysSinceEngagement !== null &&
    ayah.daysSinceEngagement !== undefined
  ) {
    if (ayah.daysSinceEngagement > 21) opacityClass = "opacity-[0.45]";
    else if (ayah.daysSinceEngagement > 7) opacityClass = "opacity-70";
  }

  return `h-3 w-3 cursor-pointer rounded-[2px] transition-all duration-100 hover:brightness-125 ${bgClass} ${opacityClass} ${getSelectedRingClass(isSelected)}`;
}

function getTooltipText(ayah: DecayedAyah) {
  const stateLabel =
    ayah.memoryState === "strong"
      ? "Strong"
      : ayah.memoryState === "review"
        ? "Review"
        : ayah.memoryState === "weak"
          ? "Weak"
          : "Not yet tracked";

  const daysStr =
    ayah.daysSinceEngagement !== null && ayah.daysSinceEngagement !== undefined
      ? `${Math.floor(ayah.daysSinceEngagement)} ${Math.floor(ayah.daysSinceEngagement) === 1 ? "day" : "days"} ago`
      : "";

  if (ayah.memoryState === "untracked") {
    return `${ayah.verseKey} · ${stateLabel}`;
  }

  return `${ayah.verseKey} · ${stateLabel}${daysStr ? ` · ${daysStr}` : ""}`;
}

function getSurahFocusAyah(group: SurahGroup): DecayedAyah | null {
  if (group.ayahs.length === 0) return null;

  const ranked = [...group.ayahs].sort((left, right) => {
    const leftPriority =
      left.memoryState === "weak"
        ? 3
        : left.memoryState === "review"
          ? 2
          : left.memoryState === "strong"
            ? 1
            : 0;
    const rightPriority =
      right.memoryState === "weak"
        ? 3
        : right.memoryState === "review"
          ? 2
          : right.memoryState === "strong"
            ? 1
            : 0;

    if (rightPriority !== leftPriority) return rightPriority - leftPriority;
    if (right.revisionUrgency !== left.revisionUrgency) {
      return right.revisionUrgency - left.revisionUrgency;
    }
    return left.strengthScore - right.strengthScore;
  });

  return ranked[0] ?? null;
}

function getSurahStrengthTone(strength: number) {
  if (strength > 70) return "text-emerald-600 dark:text-emerald-400";
  if (strength >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function renderSparseSegments(group: SurahGroup) {
  const totalAyahs = Math.max(group.surah.versesCount, 1);
  const segments = [
    { count: group.strongCount, className: "bg-emerald-500" },
    { count: group.reviewCount, className: "bg-amber-500" },
    { count: group.weakCount, className: "bg-red-500" },
    {
      count: Math.max(totalAyahs - group.trackedCount, 0),
      className: "bg-zinc-200 dark:bg-zinc-700",
    },
  ].filter((segment) => segment.count > 0);

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      {segments.map((segment, index) => (
        <div
          key={`${group.surah.number}-${index}`}
          className={segment.className}
          style={{ width: `${(segment.count / totalAyahs) * 100}%` }}
        />
      ))}
    </div>
  );
}

export function AyahHeatmap({
  surahGroups,
  stats,
  isLoading,
  dataSource,
  onSelectAyah,
  selectedAyah,
}: AyahHeatmapProps) {
  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg font-semibold">Memorization Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-5">
          <SkeletonHeatmap />
        </CardContent>
      </Card>
    );
  }

  const orderedGroups = [...surahGroups].sort((left, right) => left.surah.number - right.surah.number);
  const sparseGroups = orderedGroups.filter((group) => group.trackedCount < 10);
  const detailedGroups = orderedGroups.filter((group) => group.trackedCount >= 10);
  const hasDetailedSection = detailedGroups.length > 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold">Memorization Heatmap</CardTitle>
            {dataSource === "api" ? (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ● Live data from Quran.com
              </span>
            ) : (
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                ○ Sample data
              </span>
            )}
          </div>
          {stats ? (
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Overall health: {stats.overallHealthScore}
            </div>
          ) : null}
        </div>

        {stats ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:border-emerald-900 dark:text-emerald-400"
            >
              Strong: {stats.strongCount}
            </Badge>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600 dark:border-amber-900 dark:text-amber-400"
            >
              Review: {stats.reviewCount}
            </Badge>
            <Badge
              variant="outline"
              className="border-red-200 bg-red-500/10 px-2 py-0.5 text-xs text-red-600 dark:border-red-900 dark:text-red-400"
            >
              Weak: {stats.weakCount}
            </Badge>
            <Badge
              variant="outline"
              className="border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            >
              Untracked:{" "}
              {stats.totalTracked > 0
                ? stats.totalTracked - (stats.strongCount + stats.reviewCount + stats.weakCount)
                : 0}
            </Badge>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 pt-5">
        <TooltipProvider delayDuration={100}>
          <div className="space-y-6">
            {sparseGroups.length > 0 ? (
              <section>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Tracked surahs
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {sparseGroups.map((group) => {
                    const focusAyah = getSurahFocusAyah(group);
                    const strengthValue = Math.round(group.surahStrength);

                    return (
                      <button
                        key={group.surah.number}
                        type="button"
                        onClick={() => {
                          if (focusAyah) onSelectAyah?.(focusAyah.verseKey);
                        }}
                        className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                      >
                        <div className="w-[140px] flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                              {group.surah.number}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{group.surah.nameSimple}</p>
                              <p className="truncate text-xs text-zinc-400">
                                {group.surah.nameArabic}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          {renderSparseSegments(group)}
                          <p className="mt-2 text-xs text-zinc-400">
                            {group.trackedCount} of {group.surah.versesCount} ayahs tracked
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getSurahStrengthTone(strengthValue)}`}>
                            {strengthValue}%
                          </span>
                          <ChevronRight className="h-4 w-4 text-zinc-300" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {hasDetailedSection ? (
              <section className={sparseGroups.length > 0 ? "border-t border-zinc-200 pt-6 dark:border-zinc-800" : ""}>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Detailed view
                </p>
                <div className="flex flex-col">
                  {detailedGroups.map((group, index) => (
                    <div
                      key={group.surah.number}
                      className={`mb-2.5 flex items-start gap-3 ${index > 0 ? "border-t border-zinc-200 pt-2 dark:border-zinc-800" : ""}`}
                    >
                      <div className="w-[120px] shrink-0 select-none text-left">
                        <div
                          className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-400"
                          title={group.surah.nameSimple}
                        >
                          {group.surah.nameSimple}
                        </div>
                        <div
                          className="truncate text-xs text-zinc-500"
                          title={group.surah.nameArabic}
                        >
                          {group.surah.nameArabic}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-wrap gap-[3px]">
                        {group.ayahs.map((ayah) => {
                          const isSelected = selectedAyah === ayah.verseKey;
                          const className = getAyahSquareClasses(ayah, isSelected);

                          return (
                            <Tooltip key={ayah.verseKey}>
                              <TooltipTrigger asChild>
                                <div
                                  className={className}
                                  onClick={() => onSelectAyah?.(ayah.verseKey)}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[160px] text-xs">
                                {getTooltipText(ayah)}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </TooltipProvider>
      </CardContent>

      <div className="flex items-center justify-end border-t p-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="h-3 w-3 rounded-[2px] bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-500 opacity-[0.45]" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-500 opacity-70" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}
