import type { ReactNode } from "react";

// Surah sessions use a fullscreen overlay — no sidebar
export default function SurahSessionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
