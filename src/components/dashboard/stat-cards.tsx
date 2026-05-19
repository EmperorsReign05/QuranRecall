"use client";

import { BookOpenCheck, CalendarCheck, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardsProps {
  totalTracked?: number;
  currentStreak?: number;
  healthScore?: number;
}

export function StatCards({ totalTracked = 0, currentStreak = 0, healthScore = 0 }: StatCardsProps) {
  const stats = [
    { label: "Current streak", value: currentStreak > 0 ? `${currentStreak} days` : "Start today", icon: Flame, highlight: currentStreak === 0 },
    { label: "Ayahs tracked", value: String(totalTracked), icon: CalendarCheck },
    { label: "Health score", value: `${Math.round(healthScore)}%`, icon: BookOpenCheck },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`mt-3 ${stat.highlight ? "text-sm font-medium text-teal-600" : "text-3xl font-semibold"}`}>
                  {stat.value}
                </p>
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
