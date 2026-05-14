import { randomBytes } from 'crypto';

export function generateRandomString(length = 16): string {
  return randomBytes(32).toString('base64url').substring(0, length);
}

export function generateCodeVerifier(): string {
  // 32 bytes encoded in base64url is 43 characters, exactly meeting the 43-128 requirement
  return randomBytes(32).toString('base64url');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
