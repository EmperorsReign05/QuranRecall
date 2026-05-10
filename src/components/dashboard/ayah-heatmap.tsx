

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AyahHeatmapPlaceholder } from "@/components/dashboard/ayah-heatmap-placeholder";
import type { HifdhStats, SurahGroup, VerseKey } from "@/types/hifdh";

interface AyahHeatmapProps {
  surahGroups: SurahGroup[];
  stats: HifdhStats | null;
  isLoading: boolean;
  onSelectAyah?: (verseKey: VerseKey) => void;
  selectedAyah?: VerseKey | null;
}

export function AyahHeatmap({
  surahGroups,
  stats,
  isLoading,
  onSelectAyah,
  selectedAyah,
}: AyahHeatmapProps) {
  if (isLoading || surahGroups.length === 0) {
    return <AyahHeatmapPlaceholder />;
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Memorization Heatmap</CardTitle>
          {stats && (
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Overall health: {stats.overallHealthScore}
            </div>
          )}
        </div>
        
        {stats && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900">
              Strong: {stats.strongCount}
            </Badge>
            <Badge variant="outline" className="text-xs py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900">
              Review: {stats.reviewCount}
            </Badge>
            <Badge variant="outline" className="text-xs py-0.5 px-2 bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900">
              Weak: {stats.weakCount}
            </Badge>
            <Badge variant="outline" className="text-xs py-0.5 px-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700">
              Untracked: {stats.totalTracked > 0 ? stats.totalTracked - (stats.strongCount + stats.reviewCount + stats.weakCount) : 0}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 pt-5">
        <TooltipProvider delayDuration={100}>
          <div className="flex flex-col">
            {surahGroups.map((group, index) => (
              <div key={group.surah.number} className={`flex items-start gap-3 mb-2.5 ${index > 0 ? "border-t border-zinc-200 dark:border-zinc-800 pt-2" : ""}`}>
                <div className="w-[120px] shrink-0 text-left select-none">
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate" title={group.surah.nameSimple}>
                    {group.surah.nameSimple}
                  </div>
                  <div className="text-xs text-zinc-500 font-arabic truncate" title={group.surah.nameArabic}>
                    {group.surah.nameArabic}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-wrap gap-[3px]">
                  {group.ayahs.map((ayah) => {
                    const isSelected = selectedAyah === ayah.verseKey;
                    
                    let bgClass = "bg-zinc-200 dark:bg-zinc-800";
                    let stateLabel = "Not yet tracked";
                    
                    if (ayah.memoryState === "strong") {
                      bgClass = "bg-emerald-500";
                      stateLabel = "Strong";
                    } else if (ayah.memoryState === "review") {
                      bgClass = "bg-amber-500";
                      stateLabel = "Review";
                    } else if (ayah.memoryState === "weak") {
                      bgClass = "bg-red-500";
                      stateLabel = "Weak";
                    }
                    
                    let opacityClass = "opacity-100";
                    if (ayah.memoryState !== "untracked" && ayah.daysSinceEngagement !== null && ayah.daysSinceEngagement !== undefined) {
                      if (ayah.daysSinceEngagement > 21) opacityClass = "opacity-[0.45]";
                      else if (ayah.daysSinceEngagement > 7) opacityClass = "opacity-70";
                    }
                    
                    const ringClass = isSelected ? "ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-1 dark:ring-offset-zinc-950 z-10" : "";
                    const className = `w-3 h-3 rounded-[2px] cursor-pointer transition-all duration-100 hover:brightness-125 ${bgClass} ${opacityClass} ${ringClass}`;
                    
                    // Format tooltip string
                    const daysStr = ayah.daysSinceEngagement !== null && ayah.daysSinceEngagement !== undefined
                      ? `${Math.floor(ayah.daysSinceEngagement)} ${Math.floor(ayah.daysSinceEngagement) === 1 ? 'day' : 'days'} ago` 
                      : "";
                      
                    const tooltipText = ayah.memoryState === "untracked"
                      ? `${ayah.verseKey} • ${stateLabel}`
                      : `${ayah.verseKey} • ${stateLabel} ${daysStr ? `• ${daysStr}` : ''}`;

                    const squareNode = (
                      <div 
                        key={ayah.verseKey}
                        className={className}
                        onClick={() => onSelectAyah?.(ayah.verseKey)}
                      />
                    );

                    return (
                      <Tooltip key={ayah.verseKey}>
                        <TooltipTrigger asChild>
                          {squareNode}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[160px]">
                          {tooltipText}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
      
      <div className="p-4 border-t flex items-center justify-end text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-3 h-3 rounded-[2px] bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-500 opacity-[0.45]" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-500 opacity-70" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}
