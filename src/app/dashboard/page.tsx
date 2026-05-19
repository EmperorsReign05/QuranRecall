"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

import { AyahDetailPanel } from "@/components/dashboard/ayah-detail-panel";
import { AyahHeatmap } from "@/components/dashboard/ayah-heatmap";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TrackSurahButton } from "@/components/dashboard/TrackSurahButton";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { RevisionQueue } from "@/components/queue/RevisionQueue";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useHifdh } from "@/hooks/useHifdh";
import type { VerseKey } from "@/types/hifdh";

export default function DashboardPage() {
  const {
    surahGroups,
    stats,
    isLoading,
    markRevised,
    setDifficulty,
    revisionQueue,
    refreshData,
    currentStreak,
    dataSource,
  } = useHifdh();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [selectedAyahKey, setSelectedAyahKey] = useState<VerseKey | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showWelcomeSync, setShowWelcomeSync] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let syncTimeout: number | null = null;
    setIsClient(true);

    if (!isAuthLoading && !isAuthenticated) {
      if (sessionStorage.getItem("dev_guest") !== "true") {
        router.push("/");
        return;
      }
    }

    if (isAuthLoading) return;

    if (!localStorage.getItem("hifdh_onboarded")) {
      if (isAuthenticated) {
        fetch("/api/user/sessions")
          .then((response) => response.json())
          .then((data: { sessions?: unknown[] }) => {
            const count = data.sessions?.length ?? 0;
            setSessionCount(count);

            if (count > 0) {
              localStorage.setItem("hifdh_onboarded", "true");
              setShowOnboarding(false);
              return;
            }

            setShowOnboarding(true);
          })
          .catch(() => setShowOnboarding(true));
      } else {
        setShowOnboarding(true);
      }
    }

    if (isAuthenticated && user?.firstName && !localStorage.getItem("seen_dashboard")) {
      setShowWelcomeSync(true);
      localStorage.setItem("seen_dashboard", "true");
      syncTimeout = window.setTimeout(() => {
        setShowWelcomeSync(false);
      }, 4000);
    }

    return () => {
      if (syncTimeout !== null) {
        window.clearTimeout(syncTimeout);
      }
    };
  }, [isAuthenticated, isAuthLoading, router, user?.firstName]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refreshData();
  };

  let selectedAyah = null;
  let surahName = "";
  let translatedName = "";

  if (selectedAyahKey) {
    for (const group of surahGroups) {
      const ayah = group.ayahs.find((item) => item.verseKey === selectedAyahKey);
      if (ayah) {
        selectedAyah = ayah;
        surahName = group.surah.nameSimple;
        translatedName = group.surah.translatedName;
        break;
      }
    }
  }

  if (!isClient) return null;

  const isTrulyNewUser =
    stats && stats.strongCount + stats.reviewCount + stats.weakCount === 0;
  const isAuthenticatedEmpty = dataSource === "authenticated-empty";

  return (
    <div className="relative space-y-8 overflow-hidden">
      <AnimatePresence>
        {showWelcomeSync ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed left-1/2 top-6 z-50 w-[min(90vw,32rem)] -translate-x-1/2 rounded-xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur dark:border-emerald-900/40 dark:bg-zinc-900/95"
          >
            Welcome, {user?.firstName}. Your Quran.com data is syncing...
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showOnboarding ? (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          isAuthenticated={isAuthenticated}
          firstName={user?.firstName}
          sessionCount={sessionCount}
        />
      ) : null}

      <DashboardHeader
        dataSource={dataSource}
        totalTracked={stats?.totalTracked ?? 0}
      />

      <StatCards
        totalTracked={stats?.totalTracked ?? 0}
        currentStreak={currentStreak}
        healthScore={stats?.overallHealthScore ?? 0}
        revisionDue={revisionQueue.length}
      />

      {isTrulyNewUser && !showOnboarding && !isAuthenticatedEmpty ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 p-6 shadow-2xl md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
              Getting Started
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Welcome to Quran Recall
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Your memory heatmap is currently empty. There are two powerful ways
              to build and track your Quran memorization:
            </p>

            <div className="grid gap-3 py-2 sm:grid-cols-2">
              <div className="space-y-1 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4">
                <p className="text-xs font-semibold text-emerald-400">
                  1. Active Memorization
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Use our interactive trainer featuring the proven growing-window
                  technique and memory-blur recall cycles.
                </p>
              </div>
              <div className="space-y-1 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4">
                <p className="text-xs font-semibold text-emerald-400">
                  2. Passive Tracking
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Simply read on Quran.com and watch your heatmap and
                  spaced-repetition revision cycles update in real-time.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => router.push("/memorize")}
                className="bg-emerald-500 font-medium text-white shadow-lg hover:bg-emerald-600 hover:shadow-emerald-500/20"
              >
                Start Memorizing Now
              </Button>
              <p className="text-[11px] italic text-zinc-500">
                Tip: Grey squares on the heatmap represent unmemorized verses.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div>
          {isAuthenticatedEmpty ? (
            <div className="mb-4 rounded-xl bg-teal-50 p-4 dark:bg-teal-900/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-800/40 dark:text-teal-300">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-teal-900 dark:text-teal-100">
                      Start reading on Quran.com
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-teal-800/80 dark:text-teal-100/80">
                      Read any surah on Quran.com and your ayahs will appear here
                      automatically. The heatmap updates as you read.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-teal-200 bg-transparent text-teal-700 hover:bg-teal-100 dark:border-teal-700 dark:text-teal-200 dark:hover:bg-teal-900/30"
                >
                  <Link href="https://quran.com" target="_blank" rel="noreferrer">
                    Open Quran.com
                    <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mb-3 flex items-center justify-between">
            <TrackSurahButton onSurahAdded={refreshData} />
          </div>

          <AyahHeatmap
            surahGroups={surahGroups}
            stats={stats}
            isLoading={isLoading}
            dataSource={dataSource}
            onSelectAyah={setSelectedAyahKey}
            selectedAyah={selectedAyahKey}
          />

          {isAuthenticatedEmpty ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              ● Sample data — start reading to see your progress
            </p>
          ) : null}
        </div>

        <div className="h-[600px] xl:h-auto">
          <RevisionQueue
            items={revisionQueue}
            onMarkRevised={markRevised}
            onAyahClick={(ayah) => setSelectedAyahKey(ayah.verseKey)}
          />
        </div>
      </div>

      <AnimatePresence>
        {selectedAyahKey && selectedAyah ? (
          <AyahDetailPanel
            ayah={selectedAyah}
            surahName={surahName}
            translatedName={translatedName}
            onClose={() => setSelectedAyahKey(null)}
            onMarkRevised={markRevised}
            onSetDifficulty={setDifficulty}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
