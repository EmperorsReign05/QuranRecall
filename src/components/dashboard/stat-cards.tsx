import { BookOpenCheck, CalendarCheck, Flame } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { mockStats } from "@/lib/mock-data";

const icons = [Flame, CalendarCheck, BookOpenCheck];

export function StatCards() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {mockStats.summary.map((stat, index) => {
        const Icon = icons[index] ?? BookOpenCheck;

        return (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
              </div>
              <div className="rounded-md bg-accent p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
