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
import { useHifdh } from "@/hooks/useHifdh";
import { useAuth } from "@/hooks/useAuth";
import type { VerseKey } from "@/types/hifdh";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { surahGroups, stats, isLoading, markRevised, setDifficulty, revisionQueue, refreshData } = useHifdh();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [selectedAyahKey, setSelectedAyahKey] = useState<VerseKey | null>(null);
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (!isAuthLoading && !isAuthenticated) {
      if (sessionStorage.getItem("dev_guest") !== "true") {
        router.push("/");
        return;
      }
    }

    if (!localStorage.getItem("hifdh_onboarded")) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refreshData();
  };

  console.log('surah groups:', surahGroups.length);
  console.log('revision queue:', revisionQueue);

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
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
      <DashboardHeader />
      <StatCards />
      {isTrulyNewUser && !showOnboarding && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl text-sm text-zinc-300">
          Gray squares are ayahs you haven&apos;t memorized yet. They&apos;ll turn green as you track your progress.
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <AyahHeatmap
          surahGroups={surahGroups}
          stats={stats}
          isLoading={isLoading}
          onSelectAyah={setSelectedAyahKey}
          selectedAyah={selectedAyahKey}
        />
        <div className="h-[600px] xl:h-auto">
          <RevisionQueue 
            items={revisionQueue} 
            onMarkRevised={markRevised}
            onAyahClick={(ayah) => {
              setSelectedAyahKey(ayah.verseKey);
            }}
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
