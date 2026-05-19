"use client";

import { BookOpen, Home, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Memorize", href: "/memorize", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r bg-card lg:block">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-normal">
            Quran Recall
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 w-9 text-zinc-400 hover:text-foreground"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Memorization health and revision planning.
        </p>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/memorize"
                ? pathname.startsWith("/memorize")
                : pathname === "/dashboard";

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                  isActive && "bg-accent text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.label === "Memorize" ? (
                  <span className="ml-auto rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
                    New
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border bg-background p-4">
          <p className="text-sm font-medium">Tip</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Read on Quran.com and your heatmap updates automatically.
          </p>
          <a
            href="https://quran.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-sm font-medium text-emerald-500 hover:underline"
          >
            quran.com →
          </a>
        </div>
      </div>
    </aside>
  );
}
