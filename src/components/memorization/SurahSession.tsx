"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SURAH_META_MAP } from '@/data/surahMeta';
import MemorizationSession from './MemorizationSession';
import type { VerseKey } from '@/types/hifdh';

interface SurahSessionProps {
  surahNumber: number;
}

export default function SurahSession({ surahNumber }: SurahSessionProps) {
  const router = useRouter();
  const surah = SURAH_META_MAP.get(surahNumber);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(1);

  if (!surah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold mb-4">Surah not found</h1>
        <button onClick={() => router.push('/dashboard')} className="text-emerald-500 underline">
          Go back to dashboard
        </button>
      </div>
    );
  }

  const verseKey = `${surahNumber}:${currentAyahIndex}` as VerseKey;

  const handleComplete = () => {
    if (currentAyahIndex < surah.versesCount) {
      setCurrentAyahIndex(currentAyahIndex + 1);
      // Reset scroll position if needed
      window.scrollTo(0, 0);
    } else {
      // Surah completed!
      router.push('/dashboard?completedSurah=' + surahNumber);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MemorizationSession 
        verseKey={verseKey} 
        surahName={surah.nameSimple} 
        onComplete={handleComplete}
      />
      
      {/* Surah Progress Indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
        <div className="bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold border border-white/10 shadow-2xl flex items-center gap-3 pointer-events-auto">
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(currentAyahIndex / surah.versesCount) * 100}%` }}
            />
          </div>
          <span className="text-zinc-400">
            Ayah <span className="text-white">{currentAyahIndex}</span> of {surah.versesCount}
          </span>
        </div>
      </div>
    </div>
  );
}
