import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { MotionSection } from "@/components/motion-section";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { LandingButtons } from "@/components/landing-buttons";
import { Card, CardContent } from "@/components/ui/card";
import { mockStats } from "@/lib/mock-data";

const highlights = [
  {
    title: "Memorization health",
    description:
      "See which passages need care before they become difficult to recall.",
    icon: BookOpenCheck,
  },
  {
    title: "Revision rhythm",
    description:
      "Keep a steady queue for daily, weekly, and long-range review.",
    icon: CalendarCheck,
  },
  {
    title: "Quiet focus",
    description:
      "A minimal interface inspired by Quran.com, built for consistency.",
    icon: Sparkles,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <TopNavbar />
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top,hsl(var(--accent))_0,transparent_34rem)]">
        <div className="container grid min-h-[calc(100vh-4rem)] content-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <MotionSection className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Hifdh Health
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.03] tracking-normal text-foreground md:text-7xl">
              A calmer way to understand your memorization.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Track ayah strength, revision pressure, and learning consistency
              without adding noise to your daily Quran routine.
            </p>
            <LandingButtons />
          </MotionSection>

          <MotionSection
            delay={0.12}
            className="rounded-lg border bg-card p-4 shadow-soft"
          >
            <div className="rounded-md bg-secondary/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current focus</p>
                  <h2 className="mt-1 text-2xl font-semibold">Surah Yunus</h2>
                </div>
                <div className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                  {mockStats.streakDays} day streak
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {mockStats.summary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-md border bg-card p-4"
                  >
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-md border bg-card p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  Next review
                </p>
                <p className="mt-2 text-xl font-semibold">
                  10 ayat ready for revision
                </p>
                <div className="mt-5 h-2 rounded-full bg-muted">
                  <div className="h-2 w-2/3 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </MotionSection>
        </div>
      </section>

      <section id="overview" className="container py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6">
                <item.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-6 text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
