"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { AyahHeatmap } from "@/components/dashboard/ayah-heatmap";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { AyahDetailPanel } from "@/components/dashboard/ayah-detail-panel";
import { RevisionQueue } from "@/components/queue/RevisionQueue";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { TrackSurahButton } from "@/components/dashboard/TrackSurahButton";
import { useHifdh } from "@/hooks/useHifdh";
import { useAuth } from "@/hooks/useAuth";
import type { VerseKey } from "@/types/hifdh";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showWelcomeSync, setShowWelcomeSync] = useState(false);

  useEffect(() => {
    let syncTimeout: number | null = null;
    setIsClient(true);

    if (!isAuthLoading && !isAuthenticated) {
      if (sessionStorage.getItem("dev_guest") !== "true") {
        router.push("/");
        return;
      }
    }

    // Wait for auth to resolve before checking onboarding
    if (isAuthLoading) return;

    if (!localStorage.getItem("hifdh_onboarded")) {
      if (isAuthenticated) {
        fetch("/api/user/sessions")
          .then((r) => r.json())
          .then((d: { sessions?: unknown[] }) => {
            const count = d.sessions?.length ?? 0;
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
      const ayah = group.ayahs.find(a => a.verseKey === selectedAyahKey);
      if (ayah) {
        selectedAyah = ayah;
        surahName = group.surah.nameSimple;
        translatedName = group.surah.translatedName;
        break;
      }
    }
  }

  if (!isClient) return null;

  const isTrulyNewUser = stats && stats.strongCount + stats.reviewCount + stats.weakCount === 0;
  const isAuthenticatedEmpty = dataSource === "authenticated-empty";

  return (
    <div className="space-y-8 relative overflow-hidden">
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
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          isAuthenticated={isAuthenticated}
          firstName={user?.firstName}
          sessionCount={sessionCount}
        />
      )}
      <DashboardHeader />
      <StatCards
        totalTracked={stats?.totalTracked ?? 0}
        currentStreak={currentStreak}
        healthScore={stats?.overallHealthScore ?? 0}
      />
      {isTrulyNewUser && !showOnboarding && !isAuthenticatedEmpty && (
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-emerald-500/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Decorative ambient light */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
              Getting Started
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Welcome to Quran Recall
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your memory heatmap is currently empty. There are two powerful ways to build and track your Quran memorization:
            </p>
            
            <div className="grid gap-3 sm:grid-cols-2 py-2">
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-xs text-emerald-400">1. Active Memorization</p>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Use our interactive trainer featuring the proven growing-window technique and memory-blur recall cycles.
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-xs text-emerald-400">2. Passive Tracking</p>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Simply read on Quran.com and watch your heatmap and spaced-repetition revision cycles update in real-time.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button 
                onClick={() => router.push("/memorize")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg hover:shadow-emerald-500/20"
              >
                Start Memorizing Now
              </Button>
              <p className="text-[11px] text-zinc-500 italic">
                Tip: Grey squares on the heatmap represent unmemorized verses.
              </p>
            </div>
          </div>
        </div>
      )}
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
                <Button asChild variant="outline" size="sm" className="border-teal-200 bg-transparent text-teal-700 hover:bg-teal-100 dark:border-teal-700 dark:text-teal-200 dark:hover:bg-teal-900/30">
                  <Link href="https://quran.com" target="_blank" rel="noreferrer">
                    Open Quran.com
                    <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between mb-3">
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
        {selectedAyahKey && selectedAyah && (
          <AyahDetailPanel
            ayah={selectedAyah}
            surahName={surahName}
            translatedName={translatedName}
            onClose={() => setSelectedAyahKey(null)}
            onMarkRevised={markRevised}
            onSetDifficulty={setDifficulty}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
