import {
  BarChart3,
  BookMarked,
  CalendarDays,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: Home, active: true },
  { label: "Ayah Health", href: "/dashboard", icon: BookMarked },
  { label: "Revision Queue", href: "/dashboard", icon: CalendarDays },
  { label: "Insights", href: "/dashboard", icon: BarChart3 },
  { label: "Settings", href: "/dashboard", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r bg-card lg:block">
      <div className="flex h-full flex-col p-5">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-normal"
        >
          Hifdh Health
        </Link>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Memorization health and revision planning.
        </p>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                item.active && "bg-accent text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border bg-background p-4">
          <p className="text-sm font-medium">Today</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Keep the interface quiet. Add real progress data when the backend is
            ready.
          </p>
        </div>
      </div>
    </aside>
  );
}
