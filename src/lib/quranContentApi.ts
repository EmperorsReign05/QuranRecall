import "server-only";

import type { AyahContent, SurahMeta, VerseKey } from "@/types/hifdh";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

interface RawChapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    name: string;
  };
}

interface RawVerse {
  verse_key: VerseKey;
  text_uthmani: string;
  text_indopak?: string;
  translations?: Array<{
    text: string;
  }>;
}

interface RawVersesResponse {
  verses: RawVerse[];
  pagination: {
    next_page: number | null;
  };
}

let tokenCache: TokenCache | null = null;
let chaptersCache: SurahMeta[] | null = null;

export class QuranApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "QuranApiError";
    this.statusCode = statusCode;
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new QuranApiError(`Missing required environment variable: ${name}`, 0);
  }

  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt - 60_000 > Date.now()) {
    return tokenCache.accessToken;
  }

  const clientId = getRequiredEnv("NEXT_PUBLIC_QURAN_CLIENT_ID");
  const clientSecret = getRequiredEnv("QURAN_CLIENT_SECRET");
  const authUrl = getRequiredEnv("NEXT_PUBLIC_QURAN_AUTH_URL");
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${authUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=content",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new QuranApiError(
      `Token request failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const json = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

async function apiFetch<T>(path: string): Promise<T> {
  const clientId = getRequiredEnv("NEXT_PUBLIC_QURAN_CLIENT_ID");
  const apiBase = getRequiredEnv("NEXT_PUBLIC_QURAN_API_BASE");

  const doRequest = async (): Promise<Response> => {
    const token = await getAccessToken();

    return fetch(`${apiBase}${path}`, {
      headers: {
        "x-auth-token": token,
        "x-client-id": clientId,
      },
      cache: "no-store",
    });
  };

  let response = await doRequest();

  if (response.status === 401) {
    tokenCache = null;
    response = await doRequest();
  }

  if (response.status === 401) {
    throw new QuranApiError("Unauthorized request to Quran API", 401);
  }

  if (!response.ok) {
    throw new QuranApiError(
      `Quran API request failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

function mapVerse(verse: RawVerse): AyahContent {
  return {
    verseKey: verse.verse_key,
    arabicText: verse.text_uthmani,
    arabicIndoPakText: verse.text_indopak,
    translationText: verse.translations?.[0]?.text ?? "",
  };
}

export async function fetchChapters(): Promise<SurahMeta[]> {
  if (chaptersCache) {
    return chaptersCache;
  }

  const response = await apiFetch<{ chapters: RawChapter[] }>("/chapters?language=en");

  chaptersCache = response.chapters.map((chapter) => ({
    number: chapter.id,
    nameSimple: chapter.name_simple,
    nameArabic: chapter.name_arabic,
    versesCount: chapter.verses_count,
    translatedName: chapter.translated_name.name,
  }));

  return chaptersCache;
}

export async function fetchVersesByChapter(
  chapterNumber: number,
  translationId = 20,
): Promise<AyahContent[]> {
  const verses: AyahContent[] = [];
  let currentPage = 1;
  let nextPage: number | null = 1;

  while (nextPage !== null) {
    if (currentPage > 1) {
      await sleep(100);
    }

    const response = await apiFetch<RawVersesResponse>(
      `/verses/by_chapter/${chapterNumber}?translations=${translationId}&fields=text_uthmani,text_indopak,verse_key,verse_number&per_page=50&page=${currentPage}`,
    );

    verses.push(...response.verses.map(mapVerse));
    nextPage = response.pagination.next_page;
    currentPage += 1;
  }

  return verses;
}

export async function fetchAyahContent(verseKey: VerseKey): Promise<AyahContent> {
  const response = await apiFetch<{ verse: RawVerse }>(
    `/verses/by_key/${verseKey}?translations=20&fields=text_uthmani,text_indopak,verse_key,verse_number`,
  );

  return mapVerse(response.verse);
}
