import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('qf_session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const clientId = process.env.QURAN_USER_CLIENT_ID!;
    const clientSecret = process.env.QURAN_USER_CLIENT_SECRET!;
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch(`${process.env.QURAN_USER_AUTH_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 400 });
    }

    const tokenData = await tokenRes.json();
    
    session.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      session.refreshToken = tokenData.refresh_token;
    }
    session.expiresAt = Date.now() + tokenData.expires_in * 1000;

    cookieStore.set('qf_session', JSON.stringify(session), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
