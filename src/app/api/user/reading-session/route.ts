import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function tryPostReadingSession(
  accessToken: string,
  clientId: string,
  userApiBase: string,
  verseKey: string
): Promise<Response> {
  const paths = [
    `${userApiBase}/auth/v1/reading-sessions`,
    `${userApiBase}/api/v1/reading-sessions`,
    `${userApiBase}/v1/reading-sessions`,
  ];

  const headers = {
    "x-auth-token": accessToken,
    "x-client-id": clientId,
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({ verse_key: verseKey });

  for (const url of paths) {
    const res = await fetch(url, { method: "POST", headers, body });
    const text = await res.clone().text();
    console.log(`Reading session [${url}]:`, res.status, text);
    if (res.ok) return res;
  }

  return paths.reduce<Promise<Response>>(
    (_, url) => fetch(url, { method: "POST", headers, body }),
    Promise.resolve(new Response("", { status: 404 }))
  );
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("qf_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { verseKey } = await request.json();

    const clientId = process.env.QURAN_USER_CLIENT_ID!;
    const userApiBase = process.env.QURAN_USER_API_BASE!;

    let response = await tryPostReadingSession(
      session.accessToken,
      clientId,
      userApiBase,
      verseKey
    );

    if (response.status === 401) {
      const refreshRes = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") || "" },
      });

      if (refreshRes.ok) {
        const newCookieStore = await cookies();
        const newSessionStr = newCookieStore.get("qf_session");
        if (newSessionStr) {
          const newSession = JSON.parse(newSessionStr.value);
          response = await tryPostReadingSession(
            newSession.accessToken,
            clientId,
            userApiBase,
            verseKey
          );
        }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to record session" },
        { status: response.status }
      );
    }

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reading session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
