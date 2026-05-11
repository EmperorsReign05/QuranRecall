"use client";

import { CalendarDays, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function DashboardHeader() {
  const { user, isAuthenticated, logout } = useAuth();
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
      <div className="flex flex-col items-end gap-3">
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full border border-white/5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-medium uppercase">
              {user.firstName?.[0] || 'U'}
            </div>
            <span className="text-sm text-zinc-300 hidden sm:block">
              Assalamu Alaykum, {user.firstName}
            </span>
            <button onClick={logout} className="ml-2 text-zinc-500 hover:text-zinc-300" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        <Button variant="secondary">
          <CalendarDays className="h-4 w-4" />
          This week
        </Button>
      </div>
    </section>
  );
}
