"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BookOpen, Sprout, LogIn, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { engagementStore } from "@/lib/engagementStore";
import { BEGINNER_SURAHS, JUZ_AMMA_SURAHS, SURAH_META, SURAH_META_MAP } from "@/data/surahMeta";
import type { VerseKey } from "@/types/hifdh";

export interface OnboardingFlowProps {
  onComplete: () => void;
  isAuthenticated?: boolean;
  firstName?: string;
  sessionCount?: number;
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

export function OnboardingFlow({ onComplete, isAuthenticated, firstName, sessionCount = 0 }: OnboardingFlowProps) {
  const [step, setStep] = useState(isAuthenticated ? 2 : 1);
  const [intent, setIntent] = useState<Intent>(null);
  const router = useRouter();

  const [selectedStartSurah, setSelectedStartSurah] = useState<number | null>(null);
  const [selectedSomeSurahs, setSelectedSomeSurahs] = useState<Set<number>>(new Set());
  const [includesAyatulKursi, setIncludesAyatulKursi] = useState(false);
  const [maintainLevel, setMaintainLevel] = useState<MaintainLevel>(null);
  const [selectedJuz, setSelectedJuz] = useState<Set<number>>(new Set());
  const [lastRevised, setLastRevised] = useState<TimeAgo>(3);

  const getVerseKeysToDeclare = (): VerseKey[] => {
    const keys: VerseKey[] = [];
    if (intent === "start" && selectedStartSurah) {
      const surah = SURAH_META_MAP.get(selectedStartSurah)!;
      for (let i = 1; i <= surah.versesCount; i++) keys.push(`${surah.number}:${i}` as VerseKey);
    } else if (intent === "some") {
      selectedSomeSurahs.forEach(n => {
        const s = SURAH_META_MAP.get(n)!;
        for (let i = 1; i <= s.versesCount; i++) keys.push(`${s.number}:${i}` as VerseKey);
      });
      if (includesAyatulKursi) keys.push("2:255" as VerseKey);
    } else if (intent === "maintain") {
      let nums: number[] = [];
      if (maintainLevel === "juz_amma") nums = JUZ_AMMA_SURAHS.map(s => s.number);
      else if (maintainLevel === "full") nums = SURAH_META.map(s => s.number);
      else if (maintainLevel === "multi_juz") {
        if (selectedJuz.has(30)) nums.push(...JUZ_AMMA_SURAHS.map(s => s.number));
        if (selectedJuz.has(1)) nums.push(1, 2);
      }
      nums.forEach(n => {
        const s = SURAH_META_MAP.get(n)!;
        for (let i = 1; i <= s.versesCount; i++) keys.push(`${s.number}:${i}` as VerseKey);
      });
    }
    return keys;
  };

  const handleComplete = () => {
    const keys = getVerseKeysToDeclare();
    if (keys.length > 0) {
      if (intent === "start") {
        localStorage.setItem("hifdh_onboarding_target", String(selectedStartSurah));
      } else {
        engagementStore.declareMemorized(keys, lastRevised, 1);
      }
    }
    localStorage.setItem("hifdh_onboarded", "true");
    if (intent === "start" && selectedStartSurah) {
      router.push(`/memorize/surah/${selectedStartSurah}`);
      onComplete();
    } else {
      onComplete();
    }
  };

  const renderStep1Connect = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto text-center">
      <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
        <BookOpen className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-3">Track your Quran memorization</h1>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8">
        Connect your Quran.com account to get started. Your reading history syncs automatically.
      </p>

      <Button
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 text-base gap-2 mb-4"
        onClick={() => { window.location.href = "/api/auth/login"; }}
      >
        <LogIn className="w-4 h-4" />
        Sign in with Quran.com
      </Button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs text-zinc-600">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <button
        onClick={() => setStep(2)}
        className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors block w-full"
      >
        Continue without account
        <span className="block text-xs text-zinc-600 mt-1">Use demo data — sign in later to sync real progress</span>
      </button>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-zinc-600">
        <Shield className="w-3 h-3" />
        We only read your reading history. We never post without your action.
      </div>
    </motion.div>
  );

  const renderStep2AuthFound = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
      <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-7 h-7 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
      <p className="text-zinc-400 text-sm mb-8">
        We found <span className="text-emerald-400 font-semibold">{sessionCount} ayahs</span> in your reading history. Your heatmap is ready.
      </p>
      <Button
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 text-base gap-2"
        onClick={() => {
          localStorage.setItem("hifdh_onboarded", "true");
          onComplete();
        }}
      >
        Start tracking <ChevronRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );

  const renderStep2NoHistory = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold tracking-tight mb-2">Welcome{firstName ? `, ${firstName}` : ""}!</h1>
      <p className="text-zinc-400 text-sm mb-6">You haven&apos;t read on Quran.com yet — let&apos;s set up your starting point.</p>
      <div className="space-y-3 text-left">
        {[
          { id: "start", icon: Sprout, title: "I want to start memorizing", desc: "I haven't memorized much yet but want to start" },
          { id: "some", icon: BookOpen, title: "I've memorized some surahs", desc: "I know a few surahs and want to track my revision" },
          { id: "maintain", icon: Shield, title: "I'm maintaining my hifdh", desc: "I've memorized a lot and need help with revision" },
        ].map((opt) => {
          const Icon = opt.icon;
          const isSelected = intent === opt.id;
          return (
            <div key={opt.id} onClick={() => setIntent(opt.id as Intent)}
              className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4 ${isSelected ? "border-emerald-500 bg-emerald-950/30" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"}`}>
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
      <Button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={!intent} onClick={() => setStep(3)}>
        Continue
      </Button>
    </motion.div>
  );

  const renderStep2Manual = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold tracking-tight mb-2">What brings you here?</h1>
        <p className="text-zinc-400 text-sm">Hifdhometer works for everyone — whether you&apos;re memorizing your first surah or maintaining a full hifdh.</p>
      </div>
      <div className="space-y-3">
        {[
          { id: "start", icon: Sprout, title: "I want to start memorizing", desc: "I haven't memorized much yet but want to start" },
          { id: "some", icon: BookOpen, title: "I've memorized some surahs", desc: "I know a few surahs and want to track my revision" },
          { id: "maintain", icon: Shield, title: "I'm maintaining my hifdh", desc: "I've memorized a lot and need help with revision" },
        ].map((opt) => {
          const Icon = opt.icon;
          const isSelected = intent === opt.id;
          return (
            <div key={opt.id} onClick={() => setIntent(opt.id as Intent)}
              className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4 ${isSelected ? "border-emerald-500 bg-emerald-950/30" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"}`}>
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
      <Button className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={!intent} onClick={() => setStep(3)}>
        Continue
      </Button>
    </motion.div>
  );

  const renderStep3Surah = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-tight mb-2">Which surahs are you memorizing?</h2>
        <p className="text-zinc-400 text-sm">Select the surahs you want to track. As you read on Quran.com, your progress updates automatically.</p>
      </div>
      {intent === "start" && (
        <div className="flex flex-col gap-2">
          {BEGINNER_SURAHS.map(surah => {
            const isSelected = selectedStartSurah === surah.number;
            return (
              <div key={surah.number} onClick={() => setSelectedStartSurah(surah.number)}
                className={`border rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between ${isSelected ? "border-emerald-500 bg-emerald-950/30" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-medium">{surah.number}</span>
                  <div>
                    <h4 className="font-medium text-sm">{surah.nameSimple}</h4>
                    <p className="text-xs text-zinc-400">{surah.translatedName}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{surah.versesCount} ayahs</span>
              </div>
            );
          })}
          <AnimatePresence>
            {selectedStartSurah && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleComplete}>
                  Start tracking <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {intent === "some" && (
        <div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 mb-4">
            {JUZ_AMMA_SURAHS.map(surah => {
              const isSel = selectedSomeSurahs.has(surah.number);
              return (
                <button key={surah.number}
                  onClick={() => { const s = new Set(selectedSomeSurahs); isSel ? s.delete(surah.number) : s.add(surah.number); setSelectedSomeSurahs(s); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSel ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}>
                  {surah.nameSimple}
                </button>
              );
            })}
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setLastRevised(opt.value)}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${lastRevised === opt.value ? "bg-zinc-700 text-white border-zinc-500" : "bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:bg-zinc-800"}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={selectedSomeSurahs.size === 0 && !includesAyatulKursi}
            onClick={handleComplete}>
            Start tracking <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
      {intent === "maintain" && (
        <div>
          <div className="space-y-3 mb-6">
            {[{ id: "juz_amma", title: "Juz Amma (Juz 30)" }, { id: "multi_juz", title: "Multiple juz" }, { id: "full", title: "Full Quran (Alhamdulillah)" }].map(opt => (
              <div key={opt.id}
                onClick={() => { setMaintainLevel(opt.id as MaintainLevel); if (opt.id === "multi_juz") setSelectedJuz(new Set([30, 29, 28])); }}
                className={`border rounded-xl p-4 cursor-pointer transition-all text-center font-medium ${maintainLevel === opt.id ? "border-emerald-500 bg-emerald-950/30 text-emerald-400" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"}`}>
                {opt.title}
              </div>
            ))}
          </div>
          {maintainLevel && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {TIME_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setLastRevised(opt.value)}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${lastRevised === opt.value ? "bg-zinc-700 text-white border-zinc-500" : "bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:bg-zinc-800"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleComplete}>
                Start tracking <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderCurrentStep = () => {
    if (step === 1) return renderStep1Connect();
    if (step === 2) {
      if (isAuthenticated && sessionCount > 0) return renderStep2AuthFound();
      if (isAuthenticated && sessionCount === 0) return renderStep2NoHistory();
      return renderStep2Manual();
    }
    if (step === 3) return renderStep3Surah();
    return null;
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step}>
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
