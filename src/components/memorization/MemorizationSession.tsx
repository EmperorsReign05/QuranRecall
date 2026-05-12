"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useAyahContent } from '@/hooks/useAyahContent';
import { engagementStore } from '@/lib/engagementStore';
import { useRouter } from 'next/navigation';
import type { VerseKey, DifficultyRating } from '@/types/hifdh';

export type MemorizationMethod = 'Standard' | 'Singapore' | 'Quick';

interface MemorizationSessionProps {
  verseKey: VerseKey;
  surahName?: string;
  onComplete?: () => void;
}

export default function MemorizationSession({ verseKey, surahName, onComplete }: MemorizationSessionProps) {
  const router = useRouter();
  const { content, isLoading: loading, error } = useAyahContent(verseKey);
  const arabicText = content?.arabicText ?? '';
  const translationText = content?.translationText ?? '';

  const [method, setMethod] = useState<MemorizationMethod>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hifdh_method');
      if (stored === 'Standard' || stored === 'Singapore' || stored === 'Quick') return stored;
    }
    return 'Standard';
  });

  const [showChunks, setShowChunks] = useState(false);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [phase, setPhase] = useState<'reading' | 'memory' | 'completed'>('reading');
  const [counter, setCounter] = useState(10);

  useEffect(() => {
    localStorage.setItem('hifdh_method', method);
    // Reset counter when method changes (only if in reading phase)
    if (phase === 'reading') {
      setCounter(method === 'Standard' ? 10 : method === 'Singapore' ? 5 : 3);
    }
  }, [method, phase]);

  const [mistakeZones, setMistakeZones] = useState<{ beginning: number; middle: number; end: number }>({
    beginning: 0,
    middle: 0,
    end: 0,
  });
  const [fullMistake, setFullMistake] = useState(false);

  // Split Arabic text into chunks (5‑7 words) when needed
  const chunks = showChunks && arabicText
    ? arabicText.split(' ').reduce<string[]>((acc: string[], word: string) => {
        if (!acc.length) acc.push(word);
        else {
          const last = acc[acc.length - 1];
          if (last.split(' ').length < 7) acc[acc.length - 1] = `${last} ${word}`;
          else acc.push(word);
        }
        return acc;
      }, [])
    : [];

  const handleReadingDone = () => {
    if (counter > 1) setCounter(counter - 1);
    else {
      // move to memory phase for methods that have it
      if (method === 'Standard' || method === 'Quick') {
        const memCount = method === 'Standard' ? 5 : 2;
        setCounter(memCount);
        setPhase('memory');
      } else {
        // Singapore alternates automatically; for simplicity just complete
        setPhase('completed');
      }
    }
  };

  const handleMemoryDone = () => {
    if (counter > 1) setCounter(counter - 1);
    else setPhase('completed');
  };

  const finalize = () => {
    // Determine difficulty rating from mistakes
    let rating: DifficultyRating = 1;
    const totalHesitations = mistakeZones.beginning + mistakeZones.middle + mistakeZones.end;
    if (fullMistake || totalHesitations >= 3) rating = 3;
    else if (totalHesitations >= 1) rating = 2;
    // Record in store
    engagementStore.markRevised(verseKey);
    engagementStore.setDifficulty(verseKey, rating);
    if (onComplete) onComplete();
    else router.back();
  };

  if (loading) return <div className="text-center py-10">Loading ayah...</div>;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center p-6 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="flex-1 text-center font-bold">
          {surahName ?? ''} {verseKey}
        </h2>
        <div className="w-20 text-right text-sm text-zinc-400">
          {phase === 'reading' ? `Reading ${counter}` : phase === 'memory' ? `Memory ${counter}` : ''}
        </div>
      </div>

      {/* Method Selector */}
      {phase === 'reading' && (
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="flex bg-zinc-800/50 p-1 rounded-lg border border-white/5">
            {(['Standard', 'Singapore', 'Quick'] as MemorizationMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  method === m 
                    ? "bg-emerald-500 text-white shadow-lg" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 text-center max-w-xs px-4 italic leading-relaxed">
            {method === 'Standard' && "Traditional: 10 reps looking + 5 reps memory. Builds deep structural strength."}
            {method === 'Singapore' && "Alternating: 5 looking + 5 memory for 3 rounds. Best for rapid rhythmic fluency."}
            {method === 'Quick' && "Light: 3 looking + 2 memory. Ideal for maintaining known surahs on busy days."}
          </p>
        </div>
      )}

      {/* Arabic & Translation */}
      <div className="w-full max-w-2xl bg-zinc-800/30 rounded-xl p-6 mb-4 relative min-h-[160px] flex flex-col justify-center">
        {error ? (
          <div className="text-center space-y-3">
            <p className="text-red-400 text-sm font-medium">Unable to load this ayah.</p>
            <p className="text-zinc-500 text-xs px-10 leading-relaxed">
              This might be because the Pre-Live API keys don&apos;t have access to this surah yet, or there&apos;s a temporary connection issue.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.back()} className="mt-2">
              Go back
            </Button>
          </div>
        ) : (
          <>
            <div 
              dir="rtl" 
              className={`text-3xl text-center leading-loose font-amiri transition-all duration-500 ${phase === 'memory' ? 'filter blur-md select-none' : ''}`}
            >
              {showChunks ? chunks[chunkIndex] ?? '' : arabicText}
            </div>
            <p className="text-sm text-zinc-400 mt-3 text-center" dangerouslySetInnerHTML={{ __html: translationText }} />
          </>
        )}
        {showChunks && (
          <div className="flex justify-between mt-2">
            <Button variant="outline" size="sm" onClick={() => setChunkIndex(i => Math.max(i - 1, 0))}>Prev</Button>
            <Button variant="outline" size="sm" onClick={() => setChunkIndex(i => Math.min(i + 1, chunks.length - 1))}>Next</Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-md space-y-4">
        {phase !== 'completed' && (
          <Button className="w-full" onClick={phase === 'reading' ? handleReadingDone : handleMemoryDone}>
            {phase === 'reading' ? `Done one reading (${counter - 1} left)` : `I recited it (${counter - 1} left)`}
          </Button>
        )}
        {phase === 'memory' && (
          <Button variant="outline" onClick={() => setShowChunks(!showChunks)}>
            {showChunks ? 'Hide chunks' : 'Show in chunks'}
          </Button>
        )}
        {phase === 'memory' && (
          <div className="flex space-x-2 justify-center text-sm text-zinc-300">
            <button onClick={() => setMistakeZones(p => ({ ...p, beginning: p.beginning + 1 }))}>Beginning</button>
            <button onClick={() => setMistakeZones(p => ({ ...p, middle: p.middle + 1 }))}>Middle</button>
            <button onClick={() => setMistakeZones(p => ({ ...p, end: p.end + 1 }))}>End</button>
            <button onClick={() => setFullMistake(!fullMistake)} className={fullMistake ? 'text-emerald-500' : ''}>Full mistake</button>
          </div>
        )}
        {phase === 'completed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <h3 className="text-xl font-semibold mb-2">Well done.</h3>
            <p className="mb-2">You&apos;ve completed {surahName ?? ''} {verseKey}</p>
            <p className="mb-4">
              {fullMistake || (mistakeZones.beginning + mistakeZones.middle + mistakeZones.end) >= 3
                ? 'Marked as Hard'
                : (mistakeZones.beginning + mistakeZones.middle + mistakeZones.end) >= 1
                ? 'Marked as Medium'
                : 'Marked as Easy'}
            </p>
            <Button onClick={finalize}>Continue</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
