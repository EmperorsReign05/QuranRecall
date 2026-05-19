"use client";

import { BookOpenCheck, CalendarCheck, Clock, Flame } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardsProps {
  totalTracked?: number;
  currentStreak?: number;
  healthScore?: number;
  revisionDue?: number;
}

function getHealthTone(healthScore: number) {
  if (healthScore > 70) return "border-emerald-500 text-emerald-600 dark:text-emerald-400";
  if (healthScore >= 40) return "border-amber-500 text-amber-600 dark:text-amber-400";
  return "border-red-500 text-red-600 dark:text-red-400";
}

export function StatCards({
  totalTracked = 0,
  currentStreak = 0,
  healthScore = 0,
  revisionDue = 0,
}: StatCardsProps) {
  const roundedHealth = Math.round(healthScore);
  const healthTone = getHealthTone(roundedHealth);

  const stats = [
    {
      label: "Current streak",
      value: currentStreak > 0 ? `${currentStreak} days` : "Start today",
      icon: Flame,
      highlight: currentStreak === 0,
    },
    {
      label: "Ayahs tracked",
      value: String(totalTracked),
      icon: CalendarCheck,
    },
    {
      label: "Health score",
      value: `${roundedHealth}%`,
      icon: BookOpenCheck,
      healthTone,
    },
    {
      label: "Revision due",
      value: revisionDue > 0 ? String(revisionDue) : "All caught up",
      sublabel: revisionDue > 0 ? "ayahs due today" : undefined,
      icon: Clock,
      highlight: revisionDue === 0,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p
                  className={`mt-3 ${
                    stat.highlight ? "text-sm font-medium text-emerald-600" : "text-3xl font-semibold"
                  }`}
                >
                  {stat.value}
                </p>
                {stat.sublabel ? (
                  <p className="mt-1 text-xs text-muted-foreground">{stat.sublabel}</p>
                ) : null}
              </div>

              {stat.label === "Health score" ? (
                <div className="relative flex h-12 w-12 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[3px] border-zinc-200 dark:border-zinc-700" />
                  <div
                    className={`absolute inset-0 rounded-full border-[3px] border-transparent ${stat.healthTone}`}
                    style={{
                      clipPath: "inset(0 0 50% 0)",
                      transform: `rotate(${Math.min(180, (roundedHealth / 100) * 180)}deg)`,
                    }}
                  />
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className="rounded-md bg-accent p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
