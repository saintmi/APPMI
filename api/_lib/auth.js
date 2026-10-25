import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');

export async function createToken(username) {
  return new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}

export function checkCredentials(username, password) {
  const expectedUser = process.env.APP_USERNAME || 'admin';
  const expectedPass = process.env.APP_PASSWORD || 'admin';
  return username === expectedUser && password === expectedPass;
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (header && typeof header === 'string') {
    const m = header.match(/^Bearer\s+(.+)$/i);
    if (m) return m[1];
  }
  const cookieHeader = req.headers?.cookie || req.headers?.Cookie;
  if (typeof cookieHeader === 'string') {
    const m = cookieHeader.match(/(?:^|;\s*)appmi_token=([^;]+)/);
    if (m) {
      try { return decodeURIComponent(m[1]); } catch { return m[1]; }
    }
  }
  return null;
}

export function buildAuthCookie(token) {
  const secure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const parts = [
    'appmi_token=' + encodeURIComponent(token),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + (7 * 24 * 60 * 60),
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearAuthCookie() {
  const secure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const parts = ['appmi_token=', 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}