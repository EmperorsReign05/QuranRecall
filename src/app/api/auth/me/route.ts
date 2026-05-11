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
    
    // Attempt refresh if close to expiring
    if (session.expiresAt < Date.now() + 60000) {
      // Logic for refresh would usually go here or trigger a background refresh.
      // We will handle refresh gracefully in reading-session route.
    }

    return NextResponse.json({ user: session.user, isAuthenticated: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
