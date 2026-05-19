import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Quran Recall",
  description: "A calm, beautiful, and distraction-free memorization health dashboard for Quran revision.",
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
      className={`${manrope.variable} ${ebGaramond.variable}`}
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
