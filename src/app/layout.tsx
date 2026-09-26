import type { Metadata, Viewport } from "next";
import { Amiri_Quran, EB_Garamond, Manrope, Scheherazade_New } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
});

const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-amiri",
});

const scheherazade = Scheherazade_New({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-scheherazade",
});

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Quran Recall",
  description: "A calm, beautiful, and distraction-free memorization health dashboard for Quran revision.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quran Recall",
  },
  openGraph: {
    title: "Quran Recall",
    description: "A calm, beautiful, and distraction-free memorization health dashboard for Quran revision.",
    url: "https://quranrecall.com",
    siteName: "Quran Recall",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quran Recall",
    description: "A calm, beautiful, and distraction-free memorization health dashboard for Quran revision.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${ebGaramond.variable} ${amiriQuran.variable} ${scheherazade.variable}`}
    >
      <head>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
