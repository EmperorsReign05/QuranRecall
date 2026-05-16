import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserReadingSessions, getUserStreaks } from "@/lib/userApi";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("qf_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const [sessions, streaks] = await Promise.all([
      getUserReadingSessions(session.accessToken),
      getUserStreaks(session.accessToken),
    ]);

    return NextResponse.json({ sessions, streaks });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
