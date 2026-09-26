import { useEffect, useState } from "react";
import type { AyahContent, VerseKey } from "@/types/hifdh";

// Re-use the same cache from useAyahContent (or separate, but named v3 to avoid HMR issues)
const contentCacheV3 = new Map<VerseKey, AyahContent>();

export function useMultiAyahContent(verseKeys: VerseKey[]) {
  const [contents, setContents] = useState<(AyahContent | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cacheKey = verseKeys.join(",");

  useEffect(() => {
    if (verseKeys.length === 0) {
      setContents([]);
      return;
    }

    const missingKeys = verseKeys.filter((k) => !contentCacheV3.has(k));

    if (missingKeys.length === 0) {
      setContents(verseKeys.map((k) => contentCacheV3.get(k) ?? null));
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all(
      missingKeys.map((key) =>
        fetch(`/api/ayah/${key}?v=3`)
          .then((r) => (r.ok ? r.json() as Promise<AyahContent> : null))
          .then((data) => {
            if (data) contentCacheV3.set(key, data);
            return data;
          })
          .catch(() => null)
      )
    ).then(() => {
      if (isMounted) {
        setContents(verseKeys.map((k) => contentCacheV3.get(k) ?? null));
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
