import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('qf_session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    
    if (Date.now() > session.expiresAt - 5 * 60 * 1000) {
    }

    return NextResponse.json({ user: session.user, isAuthenticated: true });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
