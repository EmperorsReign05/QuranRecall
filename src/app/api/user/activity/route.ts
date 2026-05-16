import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserActivityDays } from "@/lib/userApi";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("qf_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const activityDays = await getUserActivityDays(session.accessToken);

    return NextResponse.json({ activityDays });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
