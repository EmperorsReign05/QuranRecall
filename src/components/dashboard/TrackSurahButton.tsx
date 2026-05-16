"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SURAH_META, SURAH_META_MAP } from "@/data/surahMeta";
import { engagementStore } from "@/lib/engagementStore";
import type { VerseKey } from "@/types/hifdh";

interface TrackSurahButtonProps {
  onSurahAdded: () => void;
}

export function TrackSurahButton({ onSurahAdded }: TrackSurahButtonProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = SURAH_META.filter(
    (s) =>
      s.nameSimple.toLowerCase().includes(query.toLowerCase()) ||
      s.nameArabic.includes(query) ||
      String(s.number).includes(query)
  );

  const handleSelect = (surahNumber: number) => {
    const surah = SURAH_META_MAP.get(surahNumber);
    if (!surah) return;

    const keys: VerseKey[] = Array.from({ length: surah.versesCount }, (_, i) =>
      `${surah.number}:${i + 1}` as VerseKey
    );

    engagementStore.declareMemorized(keys, 0, 2);
    setOpen(false);
    setQuery("");
    onSurahAdded();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs border-zinc-700 text-zinc-400 hover:text-zinc-100"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Track a surah
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="font-semibold text-base">Add a surah to track</h2>
              <button
                onClick={() => { setOpen(false); setQuery(""); }}
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-zinc-500 shrink-0" />
                <input
                  autoFocus
                  className="bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none w-full"
                  placeholder="Search by name or number..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-96">
              {filtered.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => handleSelect(surah.number)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-400 shrink-0">
                      {surah.number}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{surah.nameSimple}</p>
                      <p className="text-xs text-zinc-500">{surah.translatedName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-lg font-arabic text-zinc-400">{surah.nameArabic}</span>
                    <span className="text-xs text-zinc-600">{surah.versesCount}v</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-8">No surahs found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
