"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DecayedAyah, RevisionQueueItem, VerseKey } from "@/types/hifdh";

export interface RevisionQueueProps {
  items: RevisionQueueItem[];
  onMarkRevised: (verseKey: VerseKey) => void;
  onAyahClick: (ayah: DecayedAyah, surahName: string) => void;
}

export function RevisionQueue({ items, onMarkRevised, onAyahClick }: RevisionQueueProps) {
  const [completedItems, setCompletedItems] = useState<Set<VerseKey>>(new Set());
  const [expandedItem, setExpandedItem] = useState<VerseKey | null>(null);

  const pendingItems = items.filter(item => !completedItems.has(item.ayah.verseKey));
  const totalMinutes = Math.ceil(items.reduce((sum, item) => sum + item.estimatedSeconds, 0) / 60);

  const handleMarkDone = (verseKey: VerseKey) => {
    onMarkRevised(verseKey);
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(verseKey);
      return newSet;
    });
    if (expandedItem === verseKey) {
      setExpandedItem(null);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItem(null);
  };

  const handleReviseClick = (e: React.MouseEvent, verseKey: VerseKey) => {
    e.stopPropagation();
    setExpandedItem(expandedItem === verseKey ? null : verseKey);
  };

  const urgentItems = pendingItems.filter(i => i.priority === 'urgent');
  const dueItems = pendingItems.filter(i => i.priority === 'due');
  const upcomingItems = pendingItems.filter(i => i.priority === 'upcoming');

  const showSectionLabels = (urgentItems.length > 0 ? 1 : 0) + (dueItems.length > 0 ? 1 : 0) + (upcomingItems.length > 0 ? 1 : 0) > 1;

  const renderSection = (sectionItems: RevisionQueueItem[], label: string, dotColorClass: string) => {
    if (sectionItems.length === 0) return null;
    return (
      <div key={label} className="flex flex-col">
        {showSectionLabels && (
          <div className="flex items-center gap-1.5 pt-4 pb-1 border-t border-zinc-800 first:border-0 first:pt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
            <span className={`text-xs font-medium ${dotColorClass.replace('bg-', 'text-')}`}>
              {label}
            </span>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {sectionItems.map((item, index) => {
            const isExpanded = expandedItem === item.ayah.verseKey;
            const isLast = !showSectionLabels && index === sectionItems.length - 1;
            
            let stripColor = "bg-zinc-600";
            if (item.priority === 'urgent') stripColor = "bg-red-500";
            else if (item.priority === 'due') stripColor = "bg-amber-400";
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ x: -20, opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingBottom: 0, paddingTop: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                key={item.ayah.verseKey}
                className={`py-3 flex flex-col w-full overflow-hidden ${!isLast ? 'border-b border-zinc-800/60' : ''}`}
                onClick={() => onAyahClick(item.ayah, item.surahName)}
              >
                <div className="flex items-center gap-3 w-full cursor-pointer">
                  <div className={`w-[3px] self-stretch rounded-[2px] ${stripColor}`} />
                  
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{item.surahName}</span>
                      <span className="text-xs text-zinc-500 whitespace-nowrap">{item.ayah.verseKey}</span>
                      
                      {item.ayah.memoryState === 'review' && (
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-amber-900/40 text-amber-300 ml-1">
                          Review soon
                        </span>
                      )}
                      {item.ayah.memoryState === 'weak' && (
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-red-900/40 text-red-300 ml-1">
                          Needs work
                        </span>
                      )}
                    </div>
                    
                    <div className="w-full h-[2px] bg-zinc-800 rounded-full mt-2 overflow-hidden flex">
                      <div 
                        className={`h-full ${item.ayah.memoryState === 'weak' ? 'bg-red-500' : item.ayah.memoryState === 'review' ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.max(5, item.ayah.strengthScore * 100)}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                    <span className="text-xs text-zinc-500">~{item.estimatedSeconds}s</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 text-xs border-zinc-700 text-zinc-300 hover:border-zinc-500 bg-transparent"
                      onClick={(e) => handleReviseClick(e, item.ayah.verseKey)}
                    >
                      Revise
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pl-4">
                        <div className="bg-zinc-800/50 rounded p-3 mb-2 font-arabic text-right text-lg text-zinc-200">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ {item.ayah.verseKey.split(':')[1]}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 px-4 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkDone(item.ayah.verseKey);
                            }}
                          >
                            Mark done
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-zinc-500 hover:text-zinc-300 h-7 px-3 text-xs"
                            onClick={(e) => handleSkip(e)}
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold tracking-tight">Today&apos;s Revision</h2>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 text-zinc-300 text-xs rounded-full px-2 py-0.5">
              {items.length} ayahs
            </div>
            <div className="text-xs text-zinc-500">
              ~{totalMinutes} min
            </div>
          </div>
        </div>
        
        <div className="w-full h-[3px] rounded-full bg-zinc-800 overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: items.length > 0 ? `${(completedItems.size / items.length) * 100}%` : '100%' }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          {completedItems.size} of {items.length} revised today
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {items.length > 0 && pendingItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center py-12"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-zinc-300 mb-1">Your hifdh is in good health.</h3>
            <p className="text-sm text-zinc-500 max-w-[200px]">
              You&apos;ve completed all revisions for today.
            </p>
          </motion.div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-zinc-300 mb-1">Your hifdh is in good health.</h3>
            <p className="text-sm text-zinc-500 max-w-[200px]">
              No revisions due today. Check back tomorrow.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {renderSection(urgentItems, "Needs attention", "bg-red-400")}
            {renderSection(dueItems, "Due for review", "bg-amber-400")}
            {renderSection(upcomingItems, "Coming up", "bg-zinc-500")}
          </div>
        )}
      </div>
    </div>
  );
}
