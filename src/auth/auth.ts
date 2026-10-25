let sessionUser: string | null = null;
let sessionActive = false;

export function getToken(): string | null {
  return null;
}

export function getUser(): string | null {
  return sessionUser;
}

export function setAuth(_token: string, username: string) {
  sessionUser = username;
  sessionActive = true;
}

export function clearAuth() {
  sessionUser = null;
  sessionActive = false;
}

export function isAuthenticated() {
  return sessionActive;
}

export async function ensureSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      clearAuth();
      return false;
    }
    const data = await res.json();
    sessionUser = data.username || sessionUser;
    sessionActive = true;
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login gagal.');
  }
  const data = await res.json().catch(() => ({}));
  setAuth('', data.username || username);
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // abaikan
  }
  clearAuth();
}