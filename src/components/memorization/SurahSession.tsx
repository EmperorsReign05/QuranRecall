"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Eye, EyeOff, CheckCircle2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SURAH_META_MAP } from "@/data/surahMeta";
import { useAyahContent } from "@/hooks/useAyahContent";
import { useMultiAyahContent } from "@/hooks/useMultiAyahContent";
import { engagementStore } from "@/lib/engagementStore";
import type { VerseKey } from "@/types/hifdh";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | "overview"      // Choose where to start
  | "learn-look"    // Read verse aloud, text visible, count reps
  | "learn-recall"  // Recall current verse alone, text blurred
  | "window-review" // Recall ayahs 1..current, all blurred
  | "complete";     // Surah finished

type Method = "standard" | "quick";
type ArabicScript = "uthmani" | "indopak";

const METHOD_CONFIG = {
  standard: { lookReps: 10, recallReps: 5, windowReps: 3 },
  quick:    { lookReps: 5,  recallReps: 3, windowReps: 2 },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AyahDisplay({
  verseKey,
  blurred,
  showTranslation = true,
  script = "uthmani",
}: {
  verseKey: VerseKey;
  blurred?: boolean;
  showTranslation?: boolean;
  script?: ArabicScript;
}) {
  const { content, isLoading, error } = useAyahContent(verseKey);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return <p className="text-zinc-500 text-sm text-center py-8">Unable to load this ayah.</p>;
  }

  const textToDisplay = script === "indopak" && content.arabicIndoPakText
    ? content.arabicIndoPakText
    : content.arabicText;

  const fontClass = script === "indopak" ? "font-scheherazade text-4xl leading-[2.6]" : "font-amiri text-3xl leading-[2.2]";

  return (
    <div className="text-center">
      <div
        dir="rtl"
        className={`${fontClass} text-zinc-850 dark:text-zinc-100 transition-all duration-500 select-none ${
          blurred ? "blur-md pointer-events-none" : ""
        }`}
      >
        {textToDisplay}
      </div>
      {showTranslation && !blurred && (
        <p
          className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: content.translationText }}
        />
      )}
    </div>
  );
}

function WindowDisplay({
  surahNumber,
  fromAyah,
  toAyah,
  blurred,
  script = "uthmani",
}: {
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  blurred: boolean;
  script?: ArabicScript;
}) {
  const keys = Array.from(
    { length: toAyah - fromAyah + 1 },
    (_, i) => `${surahNumber}:${fromAyah + i}` as VerseKey
  );
  const { contents, isLoading } = useMultiAyahContent(keys);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="text-center space-y-4">
      {contents.map((c, i) => {
        const textToDisplay = script === "indopak" && c?.arabicIndoPakText
          ? c.arabicIndoPakText
          : c?.arabicText ?? "";

        const fontClass = script === "indopak" ? "font-scheherazade text-3xl leading-[2.6]" : "font-amiri text-2xl leading-[2.2]";

        return (
          <div
            key={keys[i]}
            className={`transition-all duration-500 ${blurred ? "blur-md select-none" : ""}`}
          >
            <span className={`${fontClass} text-zinc-850 dark:text-zinc-100`}>{textToDisplay}</span>
            {!blurred && i < contents.length - 1 && (
              <div className="border-b border-zinc-200 dark:border-zinc-800 my-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Rep Counter ──────────────────────────────────────────────────────────────

function RepCounter({
  current,
  total,
  label,
  onDone,
}: {
  current: number;
  total: number;
  label: string;
  onDone: () => void;
}) {
  const remaining = total - current;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < current ? "bg-emerald-500 scale-110" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>
      <Button
        size="lg"
        className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white py-5 text-base"
        onClick={onDone}
      >
        {remaining === 1 ? `Last ${label}` : `${label} · ${remaining} left`}
      </Button>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
  surahName,
}: {
  current: number;
  total: number;
  surahName: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-6 py-3.5 z-50 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 font-semibold">{surahName}</span>
        <div className="flex-1 h-2 bg-zinc-150 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-zinc-650 dark:text-zinc-300 shrink-0 font-semibold">
          {current} / {total}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SurahSessionProps {
  surahNumber: number;
}

export default function SurahSession({ surahNumber }: SurahSessionProps) {
  const router = useRouter();
  const surah = SURAH_META_MAP.get(surahNumber);

  const [method, setMethod] = useState<Method>("standard");
  const [script, setScript] = useState<ArabicScript>("uthmani");
  const [phase, setPhase] = useState<Phase>("overview");
  const [currentAyah, setCurrentAyah] = useState(1);
  const [rep, setRep] = useState(0);

  // States to control active peeking
  const [peekActive, setPeekActive] = useState(false);
  const [windowBlurred, setWindowBlurred] = useState(true);

  // Load preferences from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScript = localStorage.getItem("hifdh_script");
      if (storedScript === "uthmani" || storedScript === "indopak") {
        setScript(storedScript as ArabicScript);
      }
    }
  }, []);

  const changeScript = (newScript: ArabicScript) => {
    setScript(newScript);
    if (typeof window !== "undefined") {
      localStorage.setItem("hifdh_script", newScript);
    }
  };

  const cfg = METHOD_CONFIG[method];
  const verseKey = `${surahNumber}:${currentAyah}` as VerseKey;

  const advanceRep = useCallback(
    (targetReps: number, nextPhase: () => void) => {
      // Always reset peek when advancing a repetition
      setPeekActive(false);

      const next = rep + 1;
      if (next >= targetReps) {
        setRep(0);
        nextPhase();
      } else {
        setRep(next);
      }
    },
    [rep]
  );

  if (!surah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-zinc-400 mb-4">Surah not found</p>
        <Button onClick={() => router.push("/memorize")}>Back to Surahs</Button>
      </div>
    );
  }

  const startLearnPhase = (ayahIndex: number) => {
    setCurrentAyah(ayahIndex);
    setRep(0);
    setPeekActive(false);
    setPhase("learn-look");
  };

  const handleLookDone = () =>
    advanceRep(cfg.lookReps, () => setPhase("learn-recall"));

  const handleRecallDone = () =>
    advanceRep(cfg.recallReps, () => {
      if (currentAyah === 1) {
        saveAyah(currentAyah);
        if (currentAyah < surah.versesCount) startLearnPhase(2);
        else setPhase("complete");
      } else {
        setWindowBlurred(true);
        setRep(0);
        setPeekActive(false);
        setPhase("window-review");
      }
    });

  const handleWindowDone = () =>
    advanceRep(cfg.windowReps, () => {
      saveAyah(currentAyah);
      const next = currentAyah + 1;
      if (next <= surah.versesCount) {
        startLearnPhase(next);
      } else {
        setPhase("complete");
      }
    });

  const saveAyah = (ayahNum: number) => {
    const key = `${surahNumber}:${ayahNum}` as VerseKey;
    engagementStore.markRevised(key);
    engagementStore.setDifficulty(key, 2);
  };

  // ── Overview ────────────────────────────────────────────────────────────────
  if (phase === "overview") {
    return (
      <div className="max-w-lg mx-auto py-16 px-6">
        <button
          onClick={() => router.push("/memorize")}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> All Surahs
        </button>

        <div className="text-center mb-10">
          <p className="text-zinc-500 text-sm mb-1">{surah.translatedName}</p>
          <h1 className="text-4xl font-bold mb-1">{surah.nameSimple}</h1>
          <p className="text-4xl font-arabic text-zinc-400 mt-2">{surah.nameArabic}</p>
          <p className="text-sm text-zinc-600 mt-3">{surah.versesCount} ayahs</p>
        </div>

        {/* Script Selection */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-4 shadow-sm">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider mb-3">Arabic Script Style</p>
          <div className="grid grid-cols-2 gap-2">
            {(["uthmani", "indopak"] as ArabicScript[]).map((scr) => (
              <button
                key={scr}
                onClick={() => changeScript(scr)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  script === scr
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <p className={`font-semibold text-sm ${script === scr ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                  {scr === "uthmani" ? "Standard (Uthmani)" : "Indo-Pak Script"}
                </p>
                <p className={`text-[10px] mt-0.5 ${script === scr ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500"}`}>
                  {scr === "uthmani" ? "Common Medina copy" : "Standard South Asian copy"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Method selector */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider mb-3">Method</p>
          <div className="grid grid-cols-2 gap-2">
            {(["standard", "quick"] as Method[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  method === m
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <p className={`font-semibold text-sm capitalize ${method === m ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-300"}`}>{m}</p>
                <p className={`text-xs mt-1 ${method === m ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500"}`}>
                  {m === "standard"
                    ? `${METHOD_CONFIG.standard.lookReps} look · ${METHOD_CONFIG.standard.recallReps} recall · ${METHOD_CONFIG.standard.windowReps} window`
                    : `${METHOD_CONFIG.quick.lookReps} look · ${METHOD_CONFIG.quick.recallReps} recall · ${METHOD_CONFIG.quick.windowReps} window`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Technique explanation */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-8 text-sm text-zinc-650 dark:text-zinc-400 space-y-2 shadow-sm">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Growing Window Method</p>
          <ol className="space-y-1.5 text-xs leading-relaxed list-decimal list-inside text-zinc-500">
            <li>Read each verse aloud <strong className="text-zinc-750 dark:text-zinc-300">{cfg.lookReps} times</strong> while looking</li>
            <li>Recite from memory <strong className="text-zinc-750 dark:text-zinc-300">{cfg.recallReps} times</strong> (text blurred)</li>
            <li>Recite all verses from verse 1 to current, <strong className="text-zinc-750 dark:text-zinc-300">{cfg.windowReps} times</strong></li>
            <li>Repeat for each new verse — your window keeps growing</li>
          </ol>
        </div>

        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 text-base shadow-lg hover:shadow-emerald-500/20"
          onClick={() => startLearnPhase(1)}
        >
          Start with Ayah 1
        </Button>
      </div>
    );
  }

  // ── Complete ─────────────────────────────────────────────────────────────────
  if (phase === "complete") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Surah complete!</h1>
          <p className="text-zinc-400 mb-1">{surah.nameSimple}</p>
          <p className="text-zinc-600 text-sm mb-8">All {surah.versesCount} ayahs recorded in your heatmap.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setPhase("overview")}>
              <RotateCcw className="w-4 h-4 mr-2" /> Redo surah
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => router.push("/dashboard")}
            >
              Go to dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Learning Phases ──────────────────────────────────────────────────────────
  const phaseLabel = {
    "learn-look": "Read aloud",
    "learn-recall": "Recall",
    "window-review": "Window review",
  }[phase as string] ?? "";

  const phaseDesc = {
    "learn-look": "Read the verse out loud while looking at the text.",
    "learn-recall": "Cover the text in your mind and recite from memory.",
    "window-review": `Recite all verses 1–${currentAyah} together from memory.`,
  }[phase as string] ?? "";

  const phaseReps = {
    "learn-look": cfg.lookReps,
    "learn-recall": cfg.recallReps,
    "window-review": cfg.windowReps,
  }[phase as string] ?? 0;

  const handleRepDone = () => {
    if (phase === "learn-look") handleLookDone();
    else if (phase === "learn-recall") handleRecallDone();
    else if (phase === "window-review") handleWindowDone();
  };

  // Determine whether block should be blurred right now
  const shouldBlur = phase === "learn-recall"
    ? !peekActive
    : phase === "window-review"
    ? windowBlurred && !peekActive
    : false;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
        <button
          onClick={() => setPhase("overview")}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-zinc-500">{surah.nameSimple} · Ayah {currentAyah}</p>
          <p className="text-sm font-semibold text-emerald-400">{phaseLabel}</p>
        </div>
        
        {/* Dynamic script toggle */}
        <button
          onClick={() => changeScript(script === "uthmani" ? "indopak" : "uthmani")}
          className="text-xs flex items-center gap-1 border border-zinc-250 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all font-medium shadow-sm"
          title="Toggle Arabic script style"
        >
          <Type className="w-3.5 h-3.5 text-emerald-500" />
          {script === "uthmani" ? "Uthmani" : "Indo-Pak"}
        </button>
      </div>

      {/* Phase description */}
      <div className="px-6 py-4 text-center">
        <p className="text-sm text-zinc-500">{phaseDesc}</p>
      </div>

      {/* Arabic text */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-8 mb-6 shadow-md dark:shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${currentAyah}-${script}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {phase === "window-review" ? (
                <WindowDisplay
                  surahNumber={surahNumber}
                  fromAyah={1}
                  toAyah={currentAyah}
                  blurred={shouldBlur}
                  script={script}
                />
              ) : (
                <AyahDisplay
                  verseKey={verseKey}
                  blurred={shouldBlur}
                  showTranslation={phase === "learn-look"}
                  script={script}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Reveal button for blurred phases */}
        {(phase === "learn-recall" || phase === "window-review") && (
          <button
            onClick={() => setPeekActive(!peekActive)}
            className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-6 transition-all border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-4 py-2 rounded-full shadow-md"
          >
            {peekActive ? (
              <>
                <EyeOff className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                Hide text
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-500 animate-pulse" />
                Peek (tap to reveal)
              </>
            )}
          </button>
        )}

        {/* Rep counter */}
        <RepCounter
          current={rep}
          total={phaseReps}
          label={phase === "learn-look" ? "reading done" : "recitation done"}
          onDone={handleRepDone}
        />
      </div>

      {/* Progress bar */}
      <ProgressBar
        current={currentAyah}
        total={surah.versesCount}
        surahName={surah.nameSimple}
      />
    </div>
  );
}
