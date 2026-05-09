import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal md:text-5xl">
          Memorization health
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          A clean foundation for ayah strength, revision workload, and
          consistency signals.
        </p>
      </div>
      <Button variant="secondary">
        <CalendarDays className="h-4 w-4" />
        This week
      </Button>
    </section>
  );
}
