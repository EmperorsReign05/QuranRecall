import type { ReactNode } from "react";

import { Sidebar } from "@/components/navigation/sidebar";
import { TopNavbar } from "@/components/navigation/top-navbar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <TopNavbar compact />
        <main className="container py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
