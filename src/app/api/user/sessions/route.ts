import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import type { ReadingSession, UserStreak } from "@/lib/userApi";

type SessionPayload = {
  reading_sessions?: ReadingSession[];
  data?: ReadingSession[];
  edges?: Array<{ node: ReadingSession }>;
};

async function fetchReadingSessions(
  accessToken: string,
): Promise<{ sessions: ReadingSession[]; errorMessage?: string }> {
  const base = process.env.QURAN_USER_API_BASE;
  const clientId = process.env.QURAN_USER_CLIENT_ID;

  if (!base || !clientId) {
    return {
      sessions: [],
      errorMessage: "Missing QURAN_USER_API_BASE or QURAN_USER_CLIENT_ID",
    };
  }

  const response = await fetch(`${base}/auth/v1/reading-sessions?first=20`, {
    headers: {
      "x-auth-token": accessToken,
      "x-client-id": clientId,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const bodyText = await response.text();
  console.log("Reading sessions raw status:", response.status);
  console.log("Reading sessions raw body:", bodyText);

  if (!response.ok) {
    return {
      sessions: [],
      errorMessage: `Reading sessions failed (${response.status}): ${bodyText}`,
    };
  }

  let payload: SessionPayload = {};
  try {
    payload = JSON.parse(bodyText) as SessionPayload;
  } catch {
    return {
      sessions: [],
      errorMessage: `Reading sessions JSON parse failed: ${bodyText}`,
    };
  }

  const sessions =
    payload.reading_sessions ??
    payload.data ??
    payload.edges?.map((edge) => edge.node) ??
    [];

  return { sessions };
}

async function fetchStreaks(accessToken: string): Promise<UserStreak> {
  const base = process.env.QURAN_USER_API_BASE;
  const clientId = process.env.QURAN_USER_CLIENT_ID;

  if (!base || !clientId) {
    return { current_streak: 0, longest_streak: 0 };
  }

  try {
    const response = await fetch(`${base}/auth/v1/streaks?first=1`, {
      headers: {
        "x-auth-token": accessToken,
        "x-client-id": clientId,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const bodyText = await response.text();
    console.log("Streaks raw status:", response.status);
    console.log("Streaks raw body:", bodyText);

    if (!response.ok) {
      return { current_streak: 0, longest_streak: 0 };
    }

    const payload = JSON.parse(bodyText) as {
      data?: Array<{
        days?: number;
        status?: string;
        current_streak?: number;
        longest_streak?: number;
      }>;
    };

    const data = Array.isArray(payload.data) ? payload.data : [];
    const activeStreak = data.find((item) => item.status === "ACTIVE") ?? data[0];
    const allDays = data.map((item) => item.days ?? 0);

    return {
      current_streak: activeStreak?.days ?? activeStreak?.current_streak ?? 0,
      longest_streak: Math.max(0, ...allDays, activeStreak?.longest_streak ?? 0),
    };
  } catch (error) {
    console.error("Streak fetch error:", error);
    return { current_streak: 0, longest_streak: 0 };
  }
}

export async function GET() {
  console.log("Sessions route hit");

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("qf_session");

    console.log("Cookie present:", !!sessionCookie);
    console.log("Env check:", {
      hasUserClientId: !!process.env.QURAN_USER_CLIENT_ID,
      hasUserSecret: !!process.env.QURAN_USER_CLIENT_SECRET,
      hasUserAuthUrl: !!process.env.QURAN_USER_AUTH_URL,
      hasUserApiBase: !!process.env.QURAN_USER_API_BASE,
    });

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value) as { accessToken?: string };
    console.log("Access token present:", !!session?.accessToken);

    if (!session.accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    const [sessionResult, streaks] = await Promise.all([
      fetchReadingSessions(session.accessToken),
      fetchStreaks(session.accessToken),
    ]);

    if (sessionResult.errorMessage) {
      return NextResponse.json(
        {
          error: "API call failed",
          details: sessionResult.errorMessage,
          sessions: [],
          streaks: { current_streak: 0, longest_streak: 0 },
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ sessions: sessionResult.sessions, streaks });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Sessions route error:", error);

    return NextResponse.json(
      {
        error: "API call failed",
        details: errorMessage,
        sessions: [],
        streaks: { current_streak: 0, longest_streak: 0 },
      },
      { status: 200 },
    );
  }
}
