import { AyahHeatmapPlaceholder } from "@/components/dashboard/ayah-heatmap-placeholder";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RevisionQueuePlaceholder } from "@/components/dashboard/revision-queue-placeholder";
import { StatCards } from "@/components/dashboard/stat-cards";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <StatCards />
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <AyahHeatmapPlaceholder />
        <RevisionQueuePlaceholder />
      </div>
    </div>
  );
}
