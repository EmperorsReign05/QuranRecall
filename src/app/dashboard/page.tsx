"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { AyahHeatmap } from "@/components/dashboard/ayah-heatmap";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { AyahDetailPanel } from "@/components/dashboard/ayah-detail-panel";
import { RevisionQueue } from "@/components/queue/RevisionQueue";
import { useHifdh } from "@/hooks/useHifdh";
import type { VerseKey } from "@/types/hifdh";

export default function DashboardPage() {
  const { surahGroups, stats, isLoading, markRevised, setDifficulty, revisionQueue } = useHifdh();
  const [selectedAyahKey, setSelectedAyahKey] = useState<VerseKey | null>(null);

  // Temporarily log to verify data flows
  console.log('surah groups:', surahGroups.length);
  console.log('revision queue:', revisionQueue);

  // Find the selected ayah and its surah details
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

  return (
    <div className="space-y-8 relative overflow-hidden">
      <DashboardHeader />
      <StatCards />
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
