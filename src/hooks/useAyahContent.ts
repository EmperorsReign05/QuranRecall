import { useEffect, useState } from "react";
import type { AyahContent, VerseKey } from "@/types/hifdh";

const contentCache = new Map<VerseKey, AyahContent>();

export function useAyahContent(verseKey: VerseKey | null) {
  const [content, setContent] = useState<AyahContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!verseKey) {
      setContent(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (contentCache.has(verseKey)) {
      setContent(contentCache.get(verseKey)!);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/ayah/${verseKey}?v=2`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ayah content");
        return res.json();
      })
      .then((data: AyahContent) => {
        contentCache.set(verseKey, data);
        if (isMounted) {
          setContent(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [verseKey]);

  return { content, isLoading, error };
}
