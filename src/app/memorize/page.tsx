"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, ChevronRight, Circle } from "lucide-react";
import { SURAH_META } from "@/data/surahMeta";
import { engagementStore } from "@/lib/engagementStore";

export default function MemorizePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [trackedSurahs, setTrackedSurahs] = useState<Set<number>>(new Set());

  useEffect(() => {
    const all = engagementStore.getAll();
    const s = new Set(all.map((e) => e.surahNumber));
    setTrackedSurahs(s);
  }, []);

  const filtered = SURAH_META.filter(
    (s) =>
      s.nameSimple.toLowerCase().includes(query.toLowerCase()) ||
      s.nameArabic.includes(query) ||
      String(s.number).includes(query)
  );

  const beginnerSurahs = SURAH_META.filter((s) => s.number >= 78);
  const tracked = SURAH_META.filter((s) => trackedSurahs.has(s.number));
  const showList = query.length > 0 ? filtered : null;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-emerald-500 font-medium tracking-wider uppercase mb-2">Memorization</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Choose a surah</h1>
        <p className="text-zinc-400 text-sm">
          Pick a surah to memorize. We&apos;ll guide you through it verse by verse using the growing-window method.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl px-4 py-3 mb-8 shadow-sm">
        <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
        <input
          autoFocus
          className="bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none w-full"
          placeholder="Search by name or number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {showList ? (
        /* Search results */
        <div className="space-y-1">
          {filtered.map((surah) => (
            <SurahRow
              key={surah.number}
              surah={surah}
              isTracked={trackedSurahs.has(surah.number)}
              onClick={() => router.push(`/memorize/surah/${surah.number}`)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">No surahs found</p>
          )}
        </div>
      ) : (
        <>
          {/* In-progress surahs */}
          {tracked.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Continue</h2>
              <div className="space-y-1">
                {tracked.map((surah) => (
                  <SurahRow
                    key={surah.number}
                    surah={surah}
                    isTracked
                    onClick={() => router.push(`/memorize/surah/${surah.number}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Beginner surahs */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              {tracked.length === 0 ? "Start here (Juz Amma)" : "Suggested for beginners"}
            </h2>
            <div className="space-y-1">
              {beginnerSurahs.slice(0, 10).map((surah) => (
                <SurahRow
                  key={surah.number}
                  surah={surah}
                  isTracked={trackedSurahs.has(surah.number)}
                  onClick={() => router.push(`/memorize/surah/${surah.number}`)}
                />
              ))}
            </div>
          </section>

          {/* All surahs */}
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">All surahs</h2>
            <div className="space-y-1">
              {SURAH_META.map((surah) => (
                <SurahRow
                  key={surah.number}
                  surah={surah}
                  isTracked={trackedSurahs.has(surah.number)}
                  onClick={() => router.push(`/memorize/surah/${surah.number}`)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SurahRow({
  surah,
  isTracked,
  onClick,
}: {
  surah: (typeof SURAH_META)[0];
  isTracked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left group border ${
        isTracked
          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          : "bg-transparent border-transparent hover:bg-white dark:hover:bg-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-700/50 hover:shadow-sm"
      }`}
    >
      <div className="text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors shrink-0">
        {isTracked ? (
          <BookOpen className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
        )}
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
          {surah.number}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{surah.nameSimple}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{surah.translatedName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xl font-arabic text-zinc-500 dark:text-zinc-400">{surah.nameArabic}</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{surah.versesCount}v</span>
        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
      </div>
    </button>
  );
}
