export function generateRandomString(length = 16): string {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let array = new Uint8Array(length);
  crypto.getRandomValues(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  return String.fromCharCode.apply(null, Array.from(array));
}

export function generateCodeVerifier(): string {
  // 43-128 chars, URL-safe random string
  return generateRandomString(43);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  // SHA-256 hash of verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)));
  // Return base64url encoded (no padding, url-safe)
  return base64Digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
