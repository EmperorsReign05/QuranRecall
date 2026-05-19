

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
  limit = 20
): Promise<ReadingSession[]> {
  try {
    const res = await fetch(
      `${process.env.QURAN_USER_API_BASE}/auth/v1/reading-sessions?first=${Math.min(limit, 20)}`,
      { headers: getHeaders(accessToken), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("getUserReadingSessions failed:", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    const sessions = (json.reading_sessions ?? json.data ?? json.edges?.map((e: {node: ReadingSession}) => e.node) ?? []) as ReadingSession[];
    return sessions;
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
      `${process.env.QURAN_USER_API_BASE}/auth/v1/activity-days?first=30`,
      { headers: getHeaders(accessToken), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("getUserActivityDays failed:", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    return (json.activity_days ?? json.data ?? json.edges?.map((e: {node: ActivityDay}) => e.node) ?? []) as ActivityDay[];
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
      `${process.env.QURAN_USER_API_BASE}/auth/v1/streaks?first=1`,
      { headers: getHeaders(accessToken), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("getUserStreaks failed:", res.status, await res.text());
      return fallback;
    }
    const json = await res.json();
    // API returns { data: [ { days, status, type, ... } ] }
    const data: Array<{ days?: number; status?: string; current_streak?: number; longest_streak?: number }> = Array.isArray(json.data) ? json.data : [];
    const activeStreak = data.find(s => s.status === 'ACTIVE') ?? data[0];
    const allDays = data.map(s => s.days ?? 0);
    return {
      current_streak: activeStreak?.days ?? activeStreak?.current_streak ?? 0,
      longest_streak: Math.max(0, ...allDays, activeStreak?.longest_streak ?? 0),
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
      await res.text();
      if (res.ok) return true;
    } catch (e) {
      console.error(`postReadingSession [${url}] error:`, e);
    }
  }
  return false;
}
