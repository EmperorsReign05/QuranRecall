"use client";

import { LogOut } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  dataSource: "api" | "local" | "authenticated-empty";
  totalTracked: number;
}

export function DashboardHeader({
  dataSource,
  totalTracked,
}: DashboardHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const subtitle =
    dataSource === "api"
      ? `Showing your live Quran.com reading history · ${totalTracked} ayahs tracked`
      : "Connect your Quran.com account to sync your reading history";

  return (
    <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal md:text-5xl">
          Memorization health
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm dark:border-white/5 dark:bg-zinc-800/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium uppercase text-emerald-600 dark:text-emerald-500">
              {user.firstName?.[0] || "U"}
            </div>
            <span className="hidden text-sm text-zinc-700 dark:text-zinc-300 sm:block">
              Assalamu Alaykum, {user.firstName}
            </span>
            <button
              onClick={logout}
              className="ml-2 text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              title="Logout"
              type="button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
