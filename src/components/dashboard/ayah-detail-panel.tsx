"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Check, Loader2, AlertTriangle, BookOpen, Calendar, Star, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAyahContent } from "@/hooks/useAyahContent";
import type { DecayedAyah, DifficultyRating, VerseKey } from "@/types/hifdh";

export interface AyahDetailPanelProps {
  ayah: DecayedAyah | null;
  surahName: string;
  translatedName: string;
  onClose: () => void;
  onMarkRevised: (verseKey: VerseKey) => void;
  onSetDifficulty: (verseKey: VerseKey, rating: DifficultyRating) => void;
  similarVerseKeys?: VerseKey[];
}

export function AyahDetailPanel({
  ayah,
  surahName,
  translatedName,
  onClose,
  onMarkRevised,
  onSetDifficulty,
  similarVerseKeys = [],
}: AyahDetailPanelProps) {
  const [reviseState, setReviseState] = useState<"idle" | "loading" | "success">("idle");
  const router = useRouter();
  const { content, isLoading: arabicLoading } = useAyahContent(ayah?.verseKey ?? null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!ayah) return null;

  const handleMarkRevised = async () => {
    if (reviseState !== "idle") return;
    setReviseState("loading");
    await new Promise((r) => setTimeout(r, 400));
    onMarkRevised(ayah.verseKey);
    setReviseState("success");
    setTimeout(() => {
      setReviseState("idle");
    }, 1500);
  };

  const getMemoryStateConfig = () => {
    switch (ayah.memoryState) {
      case "strong": return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10" };
      case "review": return { label: "Needs Review", color: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10" };
      case "weak": return { label: "Weak", color: "bg-red-500", text: "text-red-700 dark:text-red-400", bg: "bg-red-500/10" };
      default: return { label: "Not Tracked", color: "bg-zinc-400", text: "text-zinc-700 dark:text-zinc-400", bg: "bg-zinc-500/10" };
    }
  };

  const stateConfig = getMemoryStateConfig();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
      />
      <motion.div
        initial={{ x: 380 }}
        animate={{ x: 0 }}
        exit={{ x: 380 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full md:w-[380px] bg-card border-l shadow-2xl z-50 flex flex-col overflow-y-auto"
      >
        <div className="p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {surahName} <span className="text-muted-foreground font-normal">({translatedName})</span>
              </h2>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                <BookOpen className="w-4 h-4" /> Verse {ayah.verseKey}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* State Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className={`px-4 py-1.5 text-sm rounded-full ${stateConfig.bg} ${stateConfig.text}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${stateConfig.color}`} />
              {stateConfig.label}
            </Badge>
          </div>

          {/* Strength Meter */}
          {ayah.memoryState !== "untracked" && (
            <div className="space-y-2 bg-muted/40 p-4 rounded-xl border">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Memory Strength</span>
                <span className="text-muted-foreground">
                  {ayah.daysSinceEngagement !== null && ayah.daysSinceEngagement !== undefined ? `${Math.floor(ayah.daysSinceEngagement)} days ago` : "Never"}
                </span>
              </div>
              <Progress value={Math.max(0, 100 - (ayah.daysSinceEngagement || 0) * 4)} className="h-2" />
            </div>
          )}

          {/* Arabic Text */}
          <div className="text-center py-10 px-6 bg-accent/30 rounded-xl border-2 border-dashed border-accent shadow-inner min-h-[140px] flex flex-col justify-center">
            {arabicLoading ? (
              <div className="w-full">
                <div className="animate-pulse bg-zinc-700/50 rounded h-6 w-full mb-3"></div>
                <div className="animate-pulse bg-zinc-700/50 rounded h-6 w-3/4 ml-auto"></div>
              </div>
            ) : content ? (
              <>
                <p 
                  dir="rtl"
                  className="text-right text-2xl leading-loose text-zinc-100 font-arabic"
                  style={{ fontFamily: "'Amiri Quran', 'me_quran', serif" }}
                >
                  {content.arabicText}
                </p>
                {content.translationText && (
                  <p 
                    className="text-xs text-zinc-400 leading-relaxed mt-4 text-left"
                    dangerouslySetInnerHTML={{ __html: content.translationText }}
                  />
                )}
              </>
            ) : (
              <p className="text-muted-foreground font-arabic text-xl">{ayah.verseKey}</p>
            )}
          </div>

          {/* Stats Row */}
          {ayah.memoryState !== "untracked" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/40 border text-center">
                <Calendar className="w-4 h-4 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Last</span>
                <span className="font-semibold text-sm">{ayah.daysSinceEngagement !== null && ayah.daysSinceEngagement !== undefined ? Math.floor(ayah.daysSinceEngagement) : 0}d</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/40 border text-center">
                <RefreshCcw className="w-4 h-4 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Revised</span>
                <span className="font-semibold text-sm">{ayah.engagementCount || 0}x</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/40 border text-center">
                <Star className="w-4 h-4 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Rating</span>
                <span className="font-semibold text-sm capitalize">{ayah.difficultyRating === 1 ? "Easy" : ayah.difficultyRating === 2 ? "Medium" : ayah.difficultyRating === 3 ? "Hard" : "None"}</span>
              </div>
            </div>
          )}

          {/* Mutashabihat Warning */}
          {similarVerseKeys && similarVerseKeys.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-1">Similar Verses (Mutashabihat)</h4>
                <p className="text-xs opacity-90">
                  Pay close attention here. Similar verses found in: {similarVerseKeys.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-4 mt-2">
            {ayah.memoryState === "untracked" ? (
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => router.push(`/memorize/${ayah.verseKey}`)}>
                Start memorizing this ayah →
              </Button>
            ) : (
              <Button
                size="lg"
                className={`w-full transition-all duration-300 ${
                  reviseState === "success" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""
                }`}
                onClick={handleMarkRevised}
                disabled={reviseState !== "idle"}
              >
                {reviseState === "idle" && "Mark as Revised"}
                {reviseState === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
                {reviseState === "success" && (
                  <>
                    <Check className="w-5 h-5 mr-2" /> Recorded
                  </>
                )}
              </Button>
            )}

            <div className="bg-muted/40 p-1 rounded-lg flex border">
              {([1, 2, 3] as DifficultyRating[]).map((rating) => (
                <button
                  key={rating}
                  onClick={() => onSetDifficulty(ayah.verseKey, rating)}
                  className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors capitalize ${
                    ayah.difficultyRating === rating
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  {rating === 1 ? "easy" : rating === 2 ? "medium" : "hard"}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-auto pt-4">
            <p className="text-xs italic text-muted-foreground">
              Tip: Best to revise this ayah during Sunnah prayers.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
