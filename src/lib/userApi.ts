

export interface ReadingSession {
  id: string;
  verse_key: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityDay {
  day: string;
  verses_count: number;
  seconds: number;
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
}

function getHeaders(accessToken: string): Record<string, string> {
  return {
    "x-auth-token": accessToken,
    "x-client-id": process.env.QURAN_USER_CLIENT_ID!,
    "Content-Type": "application/json",
  };
}

export async function getUserReadingSessions(
  accessToken: string,
  limit = 50
): Promise<ReadingSession[]> {
  try {
    const res = await fetch(
      `${process.env.QURAN_USER_API_BASE}/auth/v1/reading-sessions?per_page=${limit}`,
      { headers: getHeaders(accessToken), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("getUserReadingSessions failed:", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    return (json.reading_sessions ?? json.data ?? []) as ReadingSession[];
  } catch (e) {
    console.error("getUserReadingSessions error:", e);
    return [];
  }
}

export async function getUserActivityDays(
  accessToken: string
): Promise<ActivityDay[]> {
  try {
    const res = await fetch(
      `${process.env.QURAN_USER_API_BASE}/auth/v1/activity-days?per_page=30`,
      { headers: getHeaders(accessToken), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("getUserActivityDays failed:", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    return (json.activity_days ?? json.data ?? []) as ActivityDay[];
  } catch (e) {
    console.error("getUserActivityDays error:", e);
    return [];
  }
}

export async function getUserStreaks(
  accessToken: string
): Promise<UserStreak> {
  const fallback: UserStreak = { current_streak: 0, longest_streak: 0 };
  try {
    const res = await fetch(
      `${process.env.QURAN_USER_API_BASE}/auth/v1/streaks`,
      { headers: getHeaders(accessToken), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("getUserStreaks failed:", res.status, await res.text());
      return fallback;
    }
    const json = await res.json();
    return {
      current_streak: json.current_streak ?? json.streak?.current ?? 0,
      longest_streak: json.longest_streak ?? json.streak?.max ?? 0,
    };
  } catch (e) {
    console.error("getUserStreaks error:", e);
    return fallback;
  }
}

export async function postReadingSession(
  accessToken: string,
  verseKey: string
): Promise<boolean> {
  const base = process.env.QURAN_USER_API_BASE!;
  const clientId = process.env.QURAN_USER_CLIENT_ID!;
  const paths = [
    `${base}/auth/v1/reading-sessions`,
    `${base}/api/v1/reading-sessions`,
    `${base}/v1/reading-sessions`,
  ];

  for (const url of paths) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "x-auth-token": accessToken,
          "x-client-id": clientId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verse_key: verseKey }),
      });
      const text = await res.text();
      console.log(`postReadingSession [${url}]:`, res.status, text);
      if (res.ok) return true;
    } catch (e) {
      console.error(`postReadingSession [${url}] error:`, e);
    }
  }
  return false;
}
