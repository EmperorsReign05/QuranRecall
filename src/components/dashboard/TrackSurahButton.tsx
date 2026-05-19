"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TrackSurahButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200 shadow-sm"
      onClick={() => router.push("/memorize")}
    >
      <Plus className="h-3.5 w-3.5 text-emerald-500" />
      Track & Memorize
    </Button>
  );
}
