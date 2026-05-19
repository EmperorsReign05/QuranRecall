"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, LogIn, Shield, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import { engagementStore } from "@/lib/engagementStore";
import {
  BEGINNER_SURAHS,
  JUZ_AMMA_SURAHS,
  SURAH_META,
  SURAH_META_MAP,
} from "@/data/surahMeta";
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

export function OnboardingFlow({
  onComplete,
  isAuthenticated,
  firstName,
  sessionCount = 0,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<Intent>(null);
  const [selectedStartSurah, setSelectedStartSurah] = useState<number | null>(null);
  const [selectedSomeSurahs, setSelectedSomeSurahs] = useState<Set<number>>(new Set());
  const [maintainLevel, setMaintainLevel] = useState<MaintainLevel>(null);
  const [selectedJuz] = useState<Set<number>>(new Set([30]));
  const [lastRevised, setLastRevised] = useState<TimeAgo>(3);

  const isAuthenticatedEmpty = Boolean(isAuthenticated) && sessionCount === 0;

  const completeOnboarding = () => {
    localStorage.setItem("hifdh_onboarded", "true");
    onComplete();
  };

  const getVerseKeysToDeclare = (): VerseKey[] => {
    const keys: VerseKey[] = [];

    if (intent === "start" && selectedStartSurah) {
      const surah = SURAH_META_MAP.get(selectedStartSurah);
      if (!surah) return keys;

      for (let verse = 1; verse <= surah.versesCount; verse += 1) {
        keys.push(`${surah.number}:${verse}` as VerseKey);
      }
      return keys;
    }

    if (intent === "some") {
      selectedSomeSurahs.forEach((number) => {
        const surah = SURAH_META_MAP.get(number);
        if (!surah) return;

        for (let verse = 1; verse <= surah.versesCount; verse += 1) {
          keys.push(`${surah.number}:${verse}` as VerseKey);
        }
      });
      return keys;
    }

    if (intent === "maintain") {
      let surahNumbers: number[] = [];

      if (maintainLevel === "juz_amma") {
        surahNumbers = JUZ_AMMA_SURAHS.map((surah) => surah.number);
      } else if (maintainLevel === "full") {
        surahNumbers = SURAH_META.map((surah) => surah.number);
      } else if (maintainLevel === "multi_juz") {
        if (selectedJuz.has(30)) {
          surahNumbers = JUZ_AMMA_SURAHS.map((surah) => surah.number);
        }
      }

      surahNumbers.forEach((number) => {
        const surah = SURAH_META_MAP.get(number);
        if (!surah) return;

        for (let verse = 1; verse <= surah.versesCount; verse += 1) {
          keys.push(`${surah.number}:${verse}` as VerseKey);
        }
      });
    }

    return keys;
  };

  const handleComplete = () => {
    const keys = getVerseKeysToDeclare();

    if (keys.length > 0) {
      if (intent === "start" && selectedStartSurah) {
        localStorage.setItem("hifdh_onboarding_target", String(selectedStartSurah));
      } else {
        engagementStore.declareMemorized(keys, lastRevised, 1);
      }
    }

    localStorage.setItem("hifdh_onboarded", "true");

    if (intent === "start" && selectedStartSurah) {
      router.push(`/memorize/surah/${selectedStartSurah}`);
    }

    onComplete();
  };

  const handleAuthenticatedEmptyStepTwoComplete = () => {
    if (selectedSomeSurahs.size > 0) {
      const keys: VerseKey[] = [];

      selectedSomeSurahs.forEach((number) => {
        const surah = SURAH_META_MAP.get(number);
        if (!surah) return;

        for (let verse = 1; verse <= surah.versesCount; verse += 1) {
          keys.push(`${surah.number}:${verse}` as VerseKey);
        }
      });

      if (keys.length > 0) {
        engagementStore.declareMemorized(keys, lastRevised, 1);
      }
    }

    completeOnboarding();
  };

  const renderAuthStepOne = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-md text-center"
    >
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <BookOpen className="h-7 w-7" />
      </div>
      <h1 className="mb-3 text-2xl font-bold tracking-tight">
        Welcome{firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-zinc-400">
        We&apos;ll track your memorization automatically as you read on Quran.com.
      </p>
      <Button
        className="w-full bg-emerald-500 py-5 text-base text-white hover:bg-emerald-600"
        onClick={() => setStep(2)}
      >
        Continue
        <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );

  const renderAuthStepTwo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-md"
    >
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-bold tracking-tight">
          Want to add surahs manually too?
        </h2>
        <p className="text-sm text-zinc-400">
          This is optional. You can also skip this and let Quran.com reading
          history populate the heatmap automatically.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {JUZ_AMMA_SURAHS.map((surah) => {
          const isSelected = selectedSomeSurahs.has(surah.number);

          return (
            <button
              key={surah.number}
              type="button"
              onClick={() => {
                const next = new Set(selectedSomeSurahs);
                if (isSelected) next.delete(surah.number);
                else next.add(surah.number);
                setSelectedSomeSurahs(next);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {surah.nameSimple}
            </button>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2">
        {TIME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setLastRevised(option.value)}
            className={`rounded-lg border p-2 text-center text-xs font-medium transition-colors ${
              lastRevised === option.value
                ? "border-zinc-500 bg-zinc-700 text-white"
                : "border-zinc-800 bg-zinc-800/30 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Button
          className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
          onClick={handleAuthenticatedEmptyStepTwoComplete}
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={completeOnboarding}
          className="block w-full text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Skip — I&apos;ll read on Quran.com
        </button>
      </div>
    </motion.div>
  );

  const renderGuestStepOne = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-md text-center"
    >
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <BookOpen className="h-7 w-7" />
      </div>
      <h1 className="mb-3 text-2xl font-bold tracking-tight">
        Track your Quran memorization
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-zinc-400">
        Connect your Quran.com account to get started. Your reading history syncs
        automatically.
      </p>

      <Button
        className="mb-4 w-full gap-2 bg-emerald-500 py-5 text-base text-white hover:bg-emerald-600"
        onClick={() => {
          window.location.href = "/api/auth/login";
        }}
      >
        <LogIn className="h-4 w-4" />
        Sign in with Quran.com
      </Button>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-600">or</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <button
        type="button"
        onClick={() => setStep(2)}
        className="block w-full text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        Continue without account
        <span className="mt-1 block text-xs text-zinc-600">
          Use sample data now — sign in later to sync real progress
        </span>
      </button>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-zinc-600">
        <Shield className="h-3 w-3" />
        We only read your reading history. We never post without your action.
      </div>
    </motion.div>
  );

  const renderGuestStepTwo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md"
    >
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-xl font-bold tracking-tight">What brings you here?</h1>
        <p className="text-sm text-zinc-400">
          Quran Recall works whether you&apos;re memorizing your first surah or
          maintaining a full hifdh.
        </p>
      </div>

      <div className="space-y-3">
        {[
          {
            id: "start",
            icon: Sprout,
            title: "I want to start memorizing",
            desc: "I haven't memorized much yet but want to start",
          },
          {
            id: "some",
            icon: BookOpen,
            title: "I've memorized some surahs",
            desc: "I know a few surahs and want to track my revision",
          },
          {
            id: "maintain",
            icon: Shield,
            title: "I'm maintaining my hifdh",
            desc: "I've memorized a lot and need help with revision",
          },
        ].map((option) => {
          const Icon = option.icon;
          const isSelected = intent === option.id;

          return (
            <div
              key={option.id}
              onClick={() => setIntent(option.id as Intent)}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-950/30"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
              }`}
            >
              <div
                className={`rounded-full p-2 ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-500"
                    : "bg-zinc-700/50 text-zinc-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{option.title}</h3>
                <p className="mt-0.5 text-xs text-zinc-400">{option.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        className="mt-8 w-full bg-emerald-500 text-white hover:bg-emerald-600"
        disabled={!intent}
        onClick={() => setStep(3)}
      >
        Continue
      </Button>
    </motion.div>
  );

  const renderGuestStepThree = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mx-auto max-w-md"
    >
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-bold tracking-tight">
          Which surahs are you memorizing?
        </h2>
        <p className="text-sm text-zinc-400">
          Select the surahs you want to track. As you read on Quran.com, your
          progress updates automatically.
        </p>
      </div>

      {intent === "start" ? (
        <div className="flex flex-col gap-2">
          {BEGINNER_SURAHS.map((surah) => {
            const isSelected = selectedStartSurah === surah.number;

            return (
              <div
                key={surah.number}
                onClick={() => setSelectedStartSurah(surah.number)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/30"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-medium">
                    {surah.number}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium">{surah.nameSimple}</h4>
                    <p className="text-xs text-zinc-400">{surah.translatedName}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{surah.versesCount} ayahs</span>
              </div>
            );
          })}

          <AnimatePresence>
            {selectedStartSurah ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4"
              >
                <Button
                  className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                  onClick={handleComplete}
                >
                  Start tracking
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      {intent === "some" ? (
        <div>
          <div className="mb-4 flex max-h-48 flex-wrap gap-2 overflow-y-auto p-1">
            {JUZ_AMMA_SURAHS.map((surah) => {
              const isSelected = selectedSomeSurahs.has(surah.number);

              return (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => {
                    const next = new Set(selectedSomeSurahs);
                    if (isSelected) next.delete(surah.number);
                    else next.add(surah.number);
                    setSelectedSomeSurahs(next);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {surah.nameSimple}
                </button>
              );
            })}
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLastRevised(option.value)}
                className={`rounded-lg border p-2 text-center text-xs font-medium transition-colors ${
                  lastRevised === option.value
                    ? "border-zinc-500 bg-zinc-700 text-white"
                    : "border-zinc-800 bg-zinc-800/30 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
            disabled={selectedSomeSurahs.size === 0}
            onClick={handleComplete}
          >
            Start tracking
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {intent === "maintain" ? (
        <div>
          <div className="mb-6 space-y-3">
            {[
              { id: "juz_amma", title: "Juz Amma (Juz 30)" },
              { id: "multi_juz", title: "Multiple juz" },
              { id: "full", title: "Full Quran (Alhamdulillah)" },
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => setMaintainLevel(option.id as MaintainLevel)}
                className={`cursor-pointer rounded-xl border p-4 text-center font-medium transition-all ${
                  maintainLevel === option.id
                    ? "border-emerald-500 bg-emerald-950/30 text-emerald-400"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                }`}
              >
                {option.title}
              </div>
            ))}
          </div>

          {maintainLevel ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 grid grid-cols-2 gap-2">
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLastRevised(option.value)}
                    className={`rounded-lg border p-2 text-center text-xs font-medium transition-colors ${
                      lastRevised === option.value
                        ? "border-zinc-500 bg-zinc-700 text-white"
                        : "border-zinc-800 bg-zinc-800/30 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={handleComplete}
              >
                Start tracking
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );

  const renderCurrentStep = () => {
    if (isAuthenticatedEmpty) {
      if (step === 1) return renderAuthStepOne();
      return renderAuthStepTwo();
    }

    if (step === 1) return renderGuestStepOne();
    if (step === 2) return renderGuestStepTwo();
    return renderGuestStepThree();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur-md">
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div key={`${isAuthenticatedEmpty ? "auth-empty" : "guest"}-${step}`}>
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
