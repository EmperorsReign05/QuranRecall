"use client";

import {
  ArrowRight,
  BookOpenText,
  HeartPulse,
  Menu,
  Moon,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { LandingButtons } from "@/components/landing-buttons";
import { MotionSection } from "@/components/motion-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Memorize", href: "/memorize" },
  { label: "Methodology", href: "#methodology" },
  { label: "Resources", href: "#resources" },
];

const sanctuaryPoints = [
  {
    title: "Sustainable pacing",
    description: "Review cycles built to preserve consistency without overload.",
    icon: HeartPulse,
  },
  {
    title: "Meditative focus",
    description: "A recitation-first interface that removes app noise on purpose.",
    icon: Waves,
  },
];

const methodologyCards = [
  {
    title: "Intentional reading",
    description: "Memorize with a clear field of view where the ayah stays central.",
    className: "bg-card/90 dark:bg-card/70",
  },
  {
    title: "Rhythmic progress",
    description: "Ayah health feels organic and legible, not like a spreadsheet.",
    className: "bg-secondary/55 dark:bg-secondary/35",
  },
  {
    title: "Community pulse",
    description: "Built for shared commitment without social pressure or vanity loops.",
    className: "bg-background/90 dark:bg-white/5",
  },
];

const featureCards = [
  {
    title: "The review rhythm",
    description:
      "Spaced repetition that respects how memorization actually fades, then surfaces the ayat that need care today.",
    icon: Sparkles,
  },
  {
    title: "Tonal reflection",
    description:
      "Reflection layers can appear after fluency, so meaning deepens without interrupting recitation practice.",
    icon: BookOpenText,
  },
  {
    title: "Soul health metrics",
    description:
      "Track steadiness, revision pressure, and daily calm in a way that supports the practice instead of gamifying it.",
    icon: HeartPulse,
  },
];

function LandingHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/72 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-3xl font-medium tracking-tight text-primary"
        >
          Quran Recall
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full text-muted-foreground hover:bg-card/80 hover:text-primary"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {mounted && !isLoading && isAuthenticated ? (
            <>
              <Button
                asChild
                className="rounded-full bg-primary px-6 text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
              <button
                type="button"
                onClick={logout}
                className="hidden text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 md:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : null}

          {mounted && !isLoading && !isAuthenticated ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Open app"
                className="rounded-full md:hidden"
              >
                <Link href="/dashboard">
                  <Menu className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                className="hidden rounded-full bg-primary px-6 text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary/90 md:inline-flex"
              >
                <Link href="/dashboard">Open app</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      <section className="bg-sanctuary-gradient relative overflow-hidden border-b border-border/60">
        <div className="bg-sanctuary-grid absolute inset-0 opacity-40" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/60 to-transparent" />

        <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <MotionSection className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">
              Surah Al-Qamar 54:17
            </p>
            <h1 className="font-display mt-6 max-w-4xl text-5xl font-medium italic leading-tight text-balance text-foreground md:text-7xl">
              &ldquo;And We have certainly made the Quran easy to remember, so is
              there any who will remember?&rdquo;
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              A sanctuary for your hifdh journey, designed to support memorization
              with calm pacing, clear revision cues, and deeper presence.
            </p>
            <LandingButtons
              className="mt-10"
              primaryClassName="rounded-full bg-primary px-7 text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-primary/90"
              secondaryClassName="rounded-full border border-border bg-background/70 px-7 text-foreground hover:bg-card/80"
            />

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span>Revision queue grounded in ayah health</span>
              <span className="hidden h-1 w-1 rounded-full bg-primary/40 sm:block" />
              <span>Focused memorization flow without visual clutter</span>
            </div>
          </MotionSection>

          <MotionSection delay={0.12} className="lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-card/70 p-4 shadow-soft backdrop-blur dark:border-white/10 dark:bg-card/80">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/10 to-transparent" />
              <div className="relative rounded-[1.5rem] border border-border/70 bg-background/90 p-6 dark:bg-[#132720]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-primary/70">
                      Today&apos;s sanctuary
                    </p>
                    <h2 className="font-display mt-3 text-4xl font-medium text-foreground">
                      Your memorization should breathe.
                    </h2>
                  </div>
                  <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    Gentle cadence
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {sanctuaryPoints.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.5rem] border border-border/70 bg-card/75 p-5 dark:bg-white/5"
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-secondary/35 p-5 dark:bg-white/5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/70">
                    Preview
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">Enter focus mode</p>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">
                        Let the interface recede so the verse stays central.
                      </p>
                    </div>
                    <Link
                      href="/memorize"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/80 text-primary transition-transform hover:-translate-y-0.5"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </MotionSection>
        </div>
      </section>

      <section
        id="methodology"
        className="container grid gap-10 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-start"
      >
        <MotionSection className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
            A journey of spiritual health
          </p>
          <h2 className="font-display mt-5 text-4xl font-medium text-foreground md:text-5xl">
            Hifdh is a rhythm to be lived, not a streak to be defended.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            The product shifts attention away from pressure and toward presence.
            Your review rhythm, memorization load, and ayah strength stay visible
            without turning the practice into another productivity dashboard.
          </p>

          <div className="mt-8 space-y-4">
            {sanctuaryPoints.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-[1.25rem] border border-border/70 bg-card/70 px-5 py-4 dark:bg-card/65"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </MotionSection>

        <MotionSection delay={0.08} className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-border/70 p-6 shadow-soft sm:row-span-2 sm:min-h-[27rem] sm:justify-end">
            <div className="flex h-full flex-col justify-end">
              <BookOpenText className="h-8 w-8 text-primary" />
              <h3 className="mt-8 font-display text-3xl font-medium">Intentional reading</h3>
              <p className="mt-3 max-w-sm leading-8 text-muted-foreground">
                Focus modes remove digital noise and leave a memorizer with the
                recitation, the ayah, and the next meaningful action.
              </p>
            </div>
          </div>

          {methodologyCards.slice(1).map((card) => (
            <div
              key={card.title}
              className={cn(
                "rounded-[2rem] border border-border/70 p-6 shadow-soft",
                card.className,
              )}
            >
              <h3 className="font-display text-2xl font-medium">{card.title}</h3>
              <p className="mt-3 leading-8 text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </MotionSection>
      </section>

      <section className="border-y border-border/60 bg-[#10231c] py-20 text-white">
        <div className="container">
          <MotionSection className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Focus mode teaser
            </p>
            <h2 className="font-display mt-5 text-4xl font-medium md:text-5xl">
              Design that breathes.
            </h2>
            <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(106,215,222,0.18),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-soft">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-8 backdrop-blur">
                <div className="mx-auto max-w-2xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display mt-6 text-3xl font-medium">
                    Enter focus mode
                  </h3>
                  <p className="mt-4 text-lg leading-8 text-white/72">
                    The reading interface quiets itself once you begin, so the
                    verses carry the full weight of attention.
                  </p>
                </div>
              </div>
            </div>
          </MotionSection>
        </div>
      </section>

      <section id="resources" className="bg-sanctuary-gradient py-20">
        <div className="container">
          <MotionSection className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
              Guided by heartbeat
            </p>
            <h2 className="font-display mt-5 text-4xl font-medium md:text-5xl">
              Features shaped around the limits and strengths of real memorization.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              The landing page language is softer now, but the underlying product
              remains practical: daily revision support, memorization health, and
              a cleaner path into focused practice.
            </p>
          </MotionSection>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featureCards.map((item, index) => (
              <MotionSection
                key={item.title}
                delay={0.06 * index}
                className="rounded-[2rem] border border-border/70 bg-card/80 p-7 shadow-soft dark:bg-card/70"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-6 text-2xl font-medium">
                  {item.title}
                </h3>
                <p className="mt-4 leading-8 text-muted-foreground">
                  {item.description}
                </p>
              </MotionSection>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <MotionSection className="mx-auto max-w-4xl rounded-[2.5rem] border border-border/70 bg-card/75 px-6 py-12 text-center shadow-soft dark:bg-card/70 md:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
            Early access
          </p>
          <h2 className="font-display mt-5 text-4xl font-medium md:text-5xl">
            Begin your journey with peace and clarity.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Join the next iteration of Quran Recall as the memorization workflow,
            ayah health tracking, and focus mode continue to mature.
          </p>

          <form className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/80 p-3 shadow-sm md:flex-row md:items-center md:rounded-full">
            <input
              suppressHydrationWarning
              type="email"
              placeholder="Enter your email"
              className="h-14 flex-1 rounded-[1rem] border border-transparent bg-transparent px-5 text-base outline-none placeholder:text-muted-foreground/70 focus:border-border md:rounded-full"
            />
            <Button className="h-14 rounded-[1rem] px-7 text-base md:rounded-full">
              Get early access
            </Button>
          </form>
        </MotionSection>
      </section>

      <footer className="border-t border-border/60 bg-card/45">
        <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-medium text-primary">
              Quran Recall
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              A sanctuary for your Quranic journey.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/" className="transition-colors hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
