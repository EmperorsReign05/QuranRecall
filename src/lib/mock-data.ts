import { MOCK_ENGAGEMENTS } from "@/data/mockEngagements";
import { applyDecay, buildRevisionQueue, calculateHifdhStats } from "@/lib/decay";

type DashboardStat = {
  label: string;
  value: string;
};

const decayedAyahs = applyDecay(MOCK_ENGAGEMENTS);
const stats = calculateHifdhStats(decayedAyahs);

export const mockStats = {
  streakDays: 12,
  summary: [
    { label: "Current streak", value: "12" },
    { label: "Reviews due", value: String(stats.reviewCount + stats.weakCount) },
    { label: "Ayat tracked", value: String(stats.totalTracked) },
  ] satisfies DashboardStat[],
};

export const mockRevisionQueue = buildRevisionQueue(decayedAyahs, new Map(), 10);
