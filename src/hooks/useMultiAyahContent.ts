import { useEffect, useState } from "react";
import type { AyahContent, VerseKey } from "@/types/hifdh";

// Re-use the same cache from useAyahContent
const contentCache = new Map<VerseKey, AyahContent>();

export function useMultiAyahContent(verseKeys: VerseKey[]) {
  const [contents, setContents] = useState<(AyahContent | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cacheKey = verseKeys.join(",");

  useEffect(() => {
    if (verseKeys.length === 0) {
      setContents([]);
      return;
    }

    const missingKeys = verseKeys.filter((k) => !contentCache.has(k));

    if (missingKeys.length === 0) {
      setContents(verseKeys.map((k) => contentCache.get(k) ?? null));
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all(
      missingKeys.map((key) =>
        fetch(`/api/ayah/${key}?v=2`)
          .then((r) => (r.ok ? r.json() as Promise<AyahContent> : null))
          .then((data) => {
            if (data) contentCache.set(key, data);
            return data;
          })
          .catch(() => null)
      )
    ).then(() => {
      if (isMounted) {
        setContents(verseKeys.map((k) => contentCache.get(k) ?? null));
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { contents, isLoading };
}
