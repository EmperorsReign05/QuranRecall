"use client";

import { Menu, Moon, Search, Sun, X, Home, BookOpen, BookMarked, CalendarDays, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Overview",       href: "/dashboard",  icon: Home },
  { label: "Memorize",       href: "/memorize",   icon: BookOpen, highlight: true },
  { label: "Ayah Health",    href: "/dashboard",  icon: BookMarked },
  { label: "Revision Queue", href: "/dashboard",  icon: CalendarDays },
  { label: "Insights",       href: "/dashboard",  icon: BarChart3 },
  { label: "Settings",       href: "/dashboard",  icon: Settings },
];

export function TopNavbar({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl",
          compact ? "lg:hidden" : "",
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="font-serif text-2xl font-semibold tracking-normal text-foreground hover:opacity-90 transition-opacity"
          >
            Quran Recall
          </Link>
          
          <div className="hidden flex-1 justify-center md:flex">
            <div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Search surah, juz, or review note</span>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {/* Desktop Navigation Links */}
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-zinc-400 hover:text-foreground">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-emerald-500 hover:text-emerald-400 font-medium">
              <Link href="/memorize">Memorize</Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="text-zinc-400 hover:text-foreground"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="lg:hidden text-zinc-400 hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-serif text-xl font-semibold">Quran Recall</span>
                <Button variant="ghost" size="icon" onClick={closeMenu} className="text-zinc-400 hover:text-zinc-100">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="space-y-1 flex-1">
                {mobileNavItems.map((item) => {
                  const isActive = item.href === "/memorize"
                    ? pathname.startsWith("/memorize")
                    : item.href === "/dashboard" && item.label === "Overview"
                    ? pathname === "/dashboard"
                    : false;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors",
                        isActive && "bg-zinc-900 text-zinc-100 border border-zinc-800",
                        item.highlight && "text-emerald-500 hover:text-emerald-400"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      {item.highlight && (
                        <span className="ml-auto text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 mt-auto">
                <p className="text-xs font-medium text-zinc-300">Quran memorization helper</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  Follow a systematic pedagogical framework to build permanent muscle memory.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
