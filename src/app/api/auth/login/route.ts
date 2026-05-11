import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge, generateRandomString } from '@/lib/pkce';
import { cookies } from 'next/headers';

export async function GET() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);
  const nonce = generateRandomString(16);

  const cookieStore = await cookies();
  cookieStore.set('qf_pkce', JSON.stringify({ codeVerifier, state, nonce }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
  });

  const authUrl = new URL(process.env.QURAN_AUTH_URL + '/oauth2/auth');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_QURAN_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_REDIRECT_URI!);
  authUrl.searchParams.set('scope', 'openid offline_access user');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return NextResponse.redirect(authUrl.toString());
}
