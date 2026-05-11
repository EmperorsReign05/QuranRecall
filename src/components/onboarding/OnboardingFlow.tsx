"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, BookOpen, Shield, ChevronRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { engagementStore } from "@/lib/engagementStore";
import { BEGINNER_SURAHS, JUZ_AMMA_SURAHS, SURAH_META, SURAH_META_MAP } from "@/data/surahMeta";
import { AyahHeatmap } from "@/components/dashboard/ayah-heatmap";
import { calculateStrengthScore } from "@/lib/decay";
import type { DecayedAyah, SurahGroup, VerseKey } from "@/types/hifdh";

export interface OnboardingFlowProps {
  onComplete: () => void;
}

type Intent = "start" | "some" | "maintain" | null;
type MaintainLevel = "juz_amma" | "multi_juz" | "full" | null;
type TimeAgo = 3 | 21 | 45 | 90;

const TIME_OPTIONS: { label: string; value: TimeAgo }[] = [
  { label: "This week", value: 3 },
  { label: "2-4 weeks ago", value: 21 },
  { label: "1-2 months ago", value: 45 },
  { label: "Longer", value: 90 },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<Intent>(null);

  // Step 2 State
  const [selectedStartSurah, setSelectedStartSurah] = useState<number | null>(null);
  const [selectedSomeSurahs, setSelectedSomeSurahs] = useState<Set<number>>(new Set());
  const [includesAyatulKursi, setIncludesAyatulKursi] = useState(false);
  
  const [maintainLevel, setMaintainLevel] = useState<MaintainLevel>(null);
  const [selectedJuz, setSelectedJuz] = useState<Set<number>>(new Set());
  
  const [lastRevised, setLastRevised] = useState<TimeAgo>(3);

  // Derive verse keys to declare
  const getVerseKeysToDeclare = (): VerseKey[] => {
    const keys: VerseKey[] = [];
    
    if (intent === "start" && selectedStartSurah) {
      const surah = SURAH_META_MAP.get(selectedStartSurah)!;
      for (let i = 1; i <= surah.versesCount; i++) {
        keys.push(`${surah.number}:${i}` as VerseKey);
      }
    } else if (intent === "some") {
      selectedSomeSurahs.forEach(surahNum => {
        const surah = SURAH_META_MAP.get(surahNum)!;
        for (let i = 1; i <= surah.versesCount; i++) {
          keys.push(`${surah.number}:${i}` as VerseKey);
        }
      });
      if (includesAyatulKursi) keys.push("2:255" as VerseKey);
    } else if (intent === "maintain") {
      let surahsToInclude: number[] = [];
      if (maintainLevel === "juz_amma") {
        surahsToInclude = JUZ_AMMA_SURAHS.map(s => s.number);
      } else if (maintainLevel === "full") {
        surahsToInclude = SURAH_META.map(s => s.number);
      } else if (maintainLevel === "multi_juz") {
        // Mock simplification: map 1-30 juz roughly to surahs (for demo)
        // Juz 30 is 78-114.
        if (selectedJuz.has(30)) {
          surahsToInclude.push(...JUZ_AMMA_SURAHS.map(s => s.number));
        }
        if (selectedJuz.has(1)) {
          surahsToInclude.push(1, 2);
        }
        // Fallback for demo logic
      }
      
      surahsToInclude.forEach(surahNum => {
        const surah = SURAH_META_MAP.get(surahNum)!;
        for (let i = 1; i <= surah.versesCount; i++) {
          keys.push(`${surah.number}:${i}` as VerseKey);
        }
      });
    }

    return keys;
  };

  const handleComplete = () => {
    const keys = getVerseKeysToDeclare();
    
    if (keys.length > 0) {
      // For "start", we shouldn't set a revision date because they haven't memorized it yet
      if (intent === "start") {
        // We actually just mark them as tracked (untracked = false) with no prior review
        // In engagementStore, declareMemorized sets lastEngagedAt. 
        // For a true beginner, we might want them strictly untracked until they click.
        // Wait, the prompt says: "Card A: Your first ayahs are ready. Tap any square as you memorize each one to mark your progress."
        // We can just not declare anything for "start", so they remain untracked (gray squares).
        // But we want ONLY their selected surah to show in the heatmap for them.
        // We will store their preferred surah in local storage.
        localStorage.setItem("hifdh_onboarding_target", String(selectedStartSurah));
      } else {
        engagementStore.declareMemorized(keys, lastRevised, 1);
      }
    }
    
    localStorage.setItem("hifdh_onboarded", "true");
    onComplete();
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">What brings you here?</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Hifdhometer works for everyone — whether you&apos;re memorizing your first surah or maintaining a full hifdh.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { id: "start", icon: Sprout, title: "I want to start memorizing", desc: "I haven't memorized much yet but want to start" },
          { id: "some", icon: BookOpen, title: "I've memorized some surahs", desc: "I know a few surahs and want to track my revision" },
          { id: "maintain", icon: Shield, title: "I'm maintaining my hifdh", desc: "I've memorized a lot and need help with revision" }
        ].map((opt) => {
          const Icon = opt.icon;
          const isSelected = intent === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setIntent(opt.id as Intent)}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                isSelected ? "border-emerald-500 bg-emerald-950/30" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
              } flex items-center gap-4`}
            >
              <div className={`p-2 rounded-full ${isSelected ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-700/50 text-zinc-400"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">{opt.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{opt.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <Button 
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" 
          disabled={!intent}
          onClick={() => setStep(2)}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );

  const renderStep2Start = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-tight mb-2">Which surah would you like to memorize first?</h2>
        <p className="text-zinc-400 text-sm">Start with one. You can always add more later.</p>
      </div>

      <div className="flex flex-col gap-2">
        {BEGINNER_SURAHS.map(surah => {
          const isSelected = selectedStartSurah === surah.number;
          return (
            <div
              key={surah.number}
              onClick={() => setSelectedStartSurah(surah.number)}
              className={`border rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between ${
                isSelected ? "border-emerald-500 bg-emerald-950/30" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-300">
                  {surah.number}
                </span>
                <div>
                  <h4 className="font-medium text-sm">{surah.nameSimple}</h4>
                  <p className="text-xs text-zinc-400">{surah.translatedName}</p>
                </div>
              </div>
              <div className="text-xs text-zinc-500">{surah.versesCount} ayahs</div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center mt-4">
        <button className="text-xs text-zinc-400 hover:text-zinc-200">or browse all 114 surahs →</button>
      </div>

      <AnimatePresence>
        {selectedStartSurah && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400 text-center mb-4">
              Great choice. You can begin memorizing {SURAH_META_MAP.get(selectedStartSurah)?.nameSimple} and track your progress here.
            </div>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setStep(3)}>
              Continue
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderStep2Some = () => {
    const commonSurahs = [1, 18, 36, 55, 67];
    
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight mb-2">Which surahs have you memorized?</h2>
          <p className="text-zinc-400 text-sm">Select all that apply. Be honest — the app tracks what needs revision.</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-zinc-300">Juz Amma (78-114)</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 text-[10px] border-zinc-700"
              onClick={() => {
                const newSet = new Set(selectedSomeSurahs);
                JUZ_AMMA_SURAHS.forEach(s => newSet.add(s.number));
                setSelectedSomeSurahs(newSet);
              }}
            >
              Select all of Juz Amma
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-1">
            {JUZ_AMMA_SURAHS.map(surah => {
              const isSelected = selectedSomeSurahs.has(surah.number);
              return (
                <button
                  key={surah.number}
                  onClick={() => {
                    const newSet = new Set(selectedSomeSurahs);
                    if (isSelected) newSet.delete(surah.number);
                    else newSet.add(surah.number);
                    setSelectedSomeSurahs(newSet);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {surah.nameSimple}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Common Surahs</h3>
          <div className="flex flex-wrap gap-2">
            {commonSurahs.map(num => {
              const surah = SURAH_META_MAP.get(num)!;
              const isSelected = selectedSomeSurahs.has(num);
              return (
                <button
                  key={num}
                  onClick={() => {
                    const newSet = new Set(selectedSomeSurahs);
                    if (isSelected) newSet.delete(num);
                    else newSet.add(num);
                    setSelectedSomeSurahs(newSet);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {surah.nameSimple}
                </button>
              );
            })}
            <button
              onClick={() => setIncludesAyatulKursi(!includesAyatulKursi)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                includesAyatulKursi ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              Ayatul Kursi (2:255)
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">When did you last revise them?</h3>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLastRevised(opt.value)}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                  lastRevised === opt.value ? "bg-zinc-700 text-white border-zinc-500" : "bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button 
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" 
          disabled={selectedSomeSurahs.size === 0 && !includesAyatulKursi}
          onClick={() => setStep(3)}
        >
          Continue
        </Button>
      </motion.div>
    );
  };

  const renderStep2Maintain = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-tight mb-2">How much have you memorized?</h2>
      </div>

      <div className="space-y-3 mb-8">
        {[
          { id: "juz_amma", title: "Juz Amma (Juz 30)" },
          { id: "multi_juz", title: "Multiple juz" },
          { id: "full", title: "Full Quran (Alhamdulillah)" },
        ].map(opt => (
          <div
            key={opt.id}
            onClick={() => {
              setMaintainLevel(opt.id as MaintainLevel);
              if (opt.id === "multi_juz") setSelectedJuz(new Set([30, 29, 28])); // demo defaults
            }}
            className={`border rounded-xl p-4 cursor-pointer transition-all text-center font-medium ${
              maintainLevel === opt.id ? "border-emerald-500 bg-emerald-950/30 text-emerald-400" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
            }`}
          >
            {opt.title}
          </div>
        ))}
      </div>

      {maintainLevel && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-sm font-medium text-zinc-300 mb-3 text-center">When did you last do a full revision?</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLastRevised(opt.value)}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                  lastRevised === opt.value ? "bg-zinc-700 text-white border-zinc-500" : "bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setStep(3)}>
            Continue
          </Button>
        </motion.div>
      )}
    </motion.div>
  );

  const renderStep3 = () => {
    // Generate a mock preview heatmap
    const declaredKeys = getVerseKeysToDeclare();
    const mockGroups: SurahGroup[] = [];
    
    // Group keys by surah
    const keysBySurah = new Map<number, VerseKey[]>();
    declaredKeys.forEach(k => {
      const s = Number(k.split(':')[0]);
      if (!keysBySurah.has(s)) keysBySurah.set(s, []);
      keysBySurah.get(s)!.push(k);
    });

    keysBySurah.forEach((keys, surahNum) => {
      const surah = SURAH_META_MAP.get(surahNum)!;
      const ayahs: DecayedAyah[] = keys.map(k => {
        // mock state based on intent
        let state: "untracked" | "strong" | "review" | "weak" = "untracked";
        let score = 0;
        const now = new Date();
        const revisedDate = new Date(now.getTime() - (lastRevised * 24 * 60 * 60 * 1000));
        
        if (intent !== "start") {
          score = Math.max(0, 1 - (lastRevised / 100)); // simple mock score
          if (score > 0.7) state = "strong";
          else if (score > 0.4) state = "review";
          else state = "weak";
        }
        
        return {
          verseKey: k,
          surahNumber: surah.number,
          ayahNumber: Number(k.split(':')[1]),
          engagementCount: intent === "start" ? 0 : 1,
          daysSinceEngagement: intent === "start" ? null : lastRevised,
          difficultyRating: 1,
          strengthScore: score,
          memoryState: state,
          revisionUrgency: 0,
          lastEngagedAt: intent === "start" ? null : revisedDate,
          lastRevisedAt: intent === "start" ? null : revisedDate,
        };
      });
      mockGroups.push({
          surah,
          ayahs,
          surahStrength: 0,
          trackedCount: ayahs.length,
          strongCount: ayahs.filter(a => a.memoryState === "strong").length,
          reviewCount: ayahs.filter(a => a.memoryState === "review").length,
          weakCount: ayahs.filter(a => a.memoryState === "weak").length,
        });
    });

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg mx-auto w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Here&apos;s your starting point</h2>
          <p className="text-zinc-400 text-sm">
            {intent === "start" 
              ? "Your first ayahs are ready. Tap any square as you memorize each one to mark your progress." 
              : "Your hifdh health is calculated from today. Revise regularly to keep your squares green."}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-8 max-h-[300px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10 pointer-events-none" />
          <div className="scale-75 origin-top opacity-60 pointer-events-none">
            <AyahHeatmap 
              surahGroups={mockGroups} 
              stats={{ totalTracked: 0, strongCount: 0, reviewCount: 0, weakCount: 0, overallHealthScore: 0 }} 
              isLoading={false} 
              onSelectAyah={() => {}} 
              selectedAyah={null} 
            />
          </div>
        </div>

        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg rounded-xl" onClick={handleComplete}>
          Start tracking <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="1">{renderStep1()}</motion.div>}
          {step === 2 && intent === "start" && <motion.div key="2start">{renderStep2Start()}</motion.div>}
          {step === 2 && intent === "some" && <motion.div key="2some">{renderStep2Some()}</motion.div>}
          {step === 2 && intent === "maintain" && <motion.div key="2maintain">{renderStep2Maintain()}</motion.div>}
          {step === 3 && <motion.div key="3">{renderStep3()}</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
