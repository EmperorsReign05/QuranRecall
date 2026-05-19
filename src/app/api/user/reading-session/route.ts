import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ReadingSessionAttempt = {
  endpoint: string;
  status: number;
  ok: boolean;
  bodyText: string;
};

async function postToEndpoint(
  endpoint: string,
  accessToken: string,
  clientId: string,
  verseKey: string,
): Promise<ReadingSessionAttempt> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-auth-token": accessToken,
        "x-client-id": clientId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ verse_key: verseKey }),
      cache: "no-store",
    });
    const bodyText = await response.text();

    return {
      endpoint,
      status: response.status,
      ok: response.ok,
      bodyText,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Reading session endpoint error [${endpoint}]`, error);
    return {
      endpoint,
      status: 500,
      ok: false,
      bodyText: message,
    };
  }
}

async function tryReadingSessionEndpoints(
  accessToken: string,
  clientId: string,
  verseKey: string,
): Promise<{
  success: boolean;
  workingAttempt: ReadingSessionAttempt;
  attempts: ReadingSessionAttempt[];
}> {
  const envBase = process.env.QURAN_USER_API_BASE;
  const endpoints = [
    envBase ? `${envBase}/auth/v1/reading-sessions` : null,
    "https://apis-prelive.quran.foundation/auth/v1/reading-sessions",
    "https://apis.quran.foundation/auth/v1/reading-sessions",
  ].filter((endpoint): endpoint is string => Boolean(endpoint));

  const attempts: ReadingSessionAttempt[] = [];

  for (const endpoint of endpoints) {
    const attempt = await postToEndpoint(endpoint, accessToken, clientId, verseKey);
    attempts.push(attempt);
    if (attempt.ok) {
      return { success: true, workingAttempt: attempt, attempts };
    }
  }

  return {
    success: false,
    workingAttempt:
      attempts[attempts.length - 1] ??
      {
        endpoint: "none",
        status: 500,
        ok: false,
        bodyText: "No endpoint attempts were made",
      },
    attempts,
  };
}

export async function POST(request: Request) {


  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("qf_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value) as { accessToken?: string };
    const { verseKey } = (await request.json()) as { verseKey?: string };

    if (!session.accessToken || !verseKey) {
      return NextResponse.json(
        { error: "Missing access token or verse key" },
        { status: 400 },
      );
    }

    const clientId = process.env.QURAN_USER_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Missing QURAN_USER_CLIENT_ID" },
        { status: 500 },
      );
    }

    let result = await tryReadingSessionEndpoints(
      session.accessToken,
      clientId,
      verseKey,
    );

    if (!result.success && result.workingAttempt.status === 401) {
      const refreshResponse = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") || "" },
      });

      if (refreshResponse.ok) {
        const refreshedCookieStore = await cookies();
        const refreshedSessionCookie = refreshedCookieStore.get("qf_session");

        if (refreshedSessionCookie) {
          const refreshedSession = JSON.parse(refreshedSessionCookie.value) as {
            accessToken?: string;
          };

          if (refreshedSession.accessToken) {
            result = await tryReadingSessionEndpoints(
              refreshedSession.accessToken,
              clientId,
              verseKey,
            );
          }
        }
      }
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to record session",
          endpoint: result.workingAttempt.endpoint,
          status: result.workingAttempt.status,
          details: result.workingAttempt.bodyText,
          attempts: result.attempts,
        },
        { status: result.workingAttempt.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      endpoint: result.workingAttempt.endpoint,
      status: result.workingAttempt.status,
    });
  } catch (error) {
    console.error("Reading session error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
