"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
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
          .then(r => r.json())
          .then(d => {
            setSessionCount(d.sessions?.length ?? 0);
            setShowOnboarding(true);
          })
          .catch(() => setShowOnboarding(true));
      } else {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, isAuthLoading, router]);

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

  return (
    <div className="space-y-8 relative overflow-hidden">
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
      {isTrulyNewUser && !showOnboarding && (
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-emerald-500/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Decorative ambient light */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
              Getting Started
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Welcome to Hifdh Health
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {dataSource === "api" ? (
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Live
                </span>
              ) : (
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
                  Demo
                </span>
              )}
            </div>
            <TrackSurahButton onSurahAdded={refreshData} />
          </div>
          <AyahHeatmap
            surahGroups={surahGroups}
            stats={stats}
            isLoading={isLoading}
            onSelectAyah={setSelectedAyahKey}
            selectedAyah={selectedAyahKey}
          />
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
