import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { code, state } = await request.json();
    const cookieStore = await cookies();
    const pkceCookie = cookieStore.get('qf_pkce');

    if (!pkceCookie) {
      return NextResponse.json({ error: 'Missing PKCE cookie' }, { status: 400 });
    }

    const { codeVerifier, state: savedState } = JSON.parse(pkceCookie.value);

    if (state !== savedState) {
      return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
    }

    const clientId = process.env.QURAN_USER_CLIENT_ID!;
    const clientSecret = process.env.QURAN_USER_CLIENT_SECRET!;
    const redirectUri = process.env.REDIRECT_URI!;
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenUrl = `${process.env.QURAN_USER_AUTH_URL}/oauth2/token`;
    
    console.log('Exchanging code at:', tokenUrl);
    console.log('Using client ID:', process.env.QURAN_USER_CLIENT_ID);

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return NextResponse.json({ error: `Token exchange failed: ${errText}` }, { status: 400 });
    }

    const tokenData = await tokenRes.json();
    
    const idTokenParts = tokenData.id_token.split('.');
    const idTokenPayload = JSON.parse(Buffer.from(idTokenParts[1], 'base64').toString());

    const user = {
      sub: idTokenPayload.sub,
      email: idTokenPayload.email,
      firstName: idTokenPayload.first_name,
      lastName: idTokenPayload.last_name,
    };

    const sessionData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      user,
    };

    cookieStore.set('qf_session', JSON.stringify(sessionData), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    cookieStore.delete('qf_pkce');

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
