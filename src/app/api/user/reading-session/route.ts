import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('qf_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { verseKey } = await request.json();

    const doRequest = async (accessToken: string) => {
      const url = `${process.env.QURAN_USER_API_BASE}/auth/v1/reading-sessions`;
      
      return fetch(url, {
        method: 'POST',
        headers: {
          'x-auth-token': accessToken,
          'x-client-id': process.env.QURAN_USER_CLIENT_ID!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verse_key: verseKey }),
      });
    };

    let response = await doRequest(session.accessToken);

    if (response.status === 401) {
      const refreshRes = await fetch(new URL('/api/auth/refresh', request.url), {
        method: 'POST',
        headers: { cookie: request.headers.get('cookie') || '' },
      });

      if (refreshRes.ok) {
        const newCookieStore = await cookies();
        const newSessionStr = newCookieStore.get('qf_session');
        if (newSessionStr) {
          const newSession = JSON.parse(newSessionStr.value);
          response = await doRequest(newSession.accessToken);
        }
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to create reading session:', response.status, errText);
      
      if (response.status === 404) {
        const fallbackUrl = `${process.env.QURAN_USER_API_BASE}/content/api/v4/reading-sessions`;
        response = await fetch(fallbackUrl, {
          method: 'POST',
          headers: {
            'x-auth-token': session.accessToken,
            'x-client-id': process.env.QURAN_USER_CLIENT_ID!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ verse_key: verseKey }),
        });
        
        if (!response.ok) {
          const fallbackText = await response.text();
          console.log('Reading session response:', response.status, fallbackText);
          return NextResponse.json({ error: 'Failed to record session' }, { status: response.status });
        }
      } else {
        return NextResponse.json({ error: 'Failed to record session' }, { status: response.status });
      }
    }

    const textData = await response.text();
    console.log('Reading session response:', response.status, textData);
    let data;
    try {
      data = JSON.parse(textData);
    } catch {
      data = { message: textData };
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reading session error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
