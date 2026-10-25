import type { Snapshot } from '../state/store.ts';
import { getToken } from '../auth/auth.ts';

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function toSerializable(s: Snapshot): any {
  const clone: any = JSON.parse(JSON.stringify(s, (_key, value) => {
    if (value instanceof ArrayBuffer) return { __type: 'ArrayBuffer', data: arrayBufferToBase64(value) };
    return value;
  }));
  return clone;
}

function fromSerializable(raw: any): Snapshot {
  const text = JSON.stringify(raw);
  const parsed = JSON.parse(text, (_key, value) => {
    if (value && typeof value === 'object' && value.__type === 'ArrayBuffer' && typeof value.data === 'string') {
      return base64ToArrayBuffer(value.data);
    }
    return value;
  });
  return parsed as Snapshot;
}

export const persistensiNeon = {
  async muat(): Promise<Snapshot | null> {
    const res = await fetch('/api/state', { headers: authHeaders(), credentials: 'include' });
    if (res.status === 204 || res.status === 404) return null;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Gagal memuat data backend (${res.status}).`);
    }
    const body = await res.json();
    return fromSerializable(body.data);
  },
  async simpan(s: Snapshot): Promise<void> {
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify({ data: toSerializable(s) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Gagal menyimpan data backend (${res.status}).`);
    }
  },
};
