import type { DashboardStat, RevisionItem } from "@/types/hifdh";

export const mockStats = {
  streakDays: 12,
  summary: [
    { label: "Current streak", value: "12" },
    { label: "Reviews due", value: "0" },
    { label: "Ayat tracked", value: "0" },
  ] satisfies DashboardStat[],
};

export const mockRevisionQueue: RevisionItem[] = [];
