// ============================================================================
// Enkripsi cadangan — AES-256-GCM (WebCrypto), kunci dari PBKDF2-SHA256.
// Tidak ada dependensi eksternal. Hanya berjalan di browser (crypto.subtle).
// ============================================================================

const ITERASI = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;
const KUNCI_LEN = 32;

function pengodeTeks(): TextEncoder {
  return new TextEncoder();
}

function pembacaTeks(): TextDecoder {
  return new TextDecoder();
}

export function uint8KeStringBase64(data: Uint8Array): string {
  let biner = '';
  for (let i = 0; i < data.length; i++) biner += String.fromCharCode(data[i]);
  return btoa(biner);
}

export function stringBase64KeUint8(teks: string): Uint8Array {
  const biner = atob(teks);
  const data = new Uint8Array(biner.length);
  for (let i = 0; i < biner.length; i++) data[i] = biner.charCodeAt(i);
  return data;
}

async function imporKunciSandi(sandi: string, salt: Uint8Array): Promise<CryptoKey> {
  const kode = pengodeTeks().encode(sandi);
  const kunciDasar = await crypto.subtle.importKey(
    'raw', kode, { name: 'PBKDF2' }, false, ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERASI, hash: 'SHA-256',
    },
    kunciDasar,
    { name: 'AES-GCM', length: KUNCI_LEN * 8 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function buatSalt(): Promise<Uint8Array> {
  const salt = new Uint8Array(SALT_LEN);
  crypto.getRandomValues(salt);
  return salt;
}

async function buatIV(): Promise<Uint8Array> {
  const iv = new Uint8Array(IV_LEN);
  crypto.getRandomValues(iv);
  return iv;
}

export interface HasilEnkripsi {
  salt: string;
  data: string; // base64 iv + ciphertext
}

export async function enkripsiSnapshot(teks: string, sandi: string): Promise<HasilEnkripsi> {
  const plain = pengodeTeks().encode(teks);
  const salt = await buatSalt();
  const kunci = await imporKunciSandi(sandi, salt);
  const iv = await buatIV();
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    kunci,
    plain as BufferSource,
  );
  const gabungan = new Uint8Array(iv.length + cipher.byteLength);
  gabungan.set(iv, 0);
  gabungan.set(new Uint8Array(cipher), iv.length);
  return {
    salt: uint8KeStringBase64(salt),
    data: uint8KeStringBase64(gabungan),
  };
}

export async function dekripsiSnapshot(hasil: HasilEnkripsi, sandi: string): Promise<string> {
  const salt = stringBase64KeUint8(hasil.salt);
  const gabungan = stringBase64KeUint8(hasil.data);
  const iv = gabungan.slice(0, IV_LEN);
  const cipher = gabungan.slice(IV_LEN);
  const kunci = await imporKunciSandi(sandi, salt);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    kunci,
    cipher as BufferSource,
  );
  return pembacaTeks().decode(new Uint8Array(plain));
}

export async function kompresi(teks: string): Promise<string> {
  const alur = new CompressionStream('gzip');
  const penulis = alur.writable.getWriter();
  penulis.write(pengodeTeks().encode(teks));
  penulis.close();
  const terkompresi = await new Response(alur.readable).arrayBuffer();
  return uint8KeStringBase64(new Uint8Array(terkompresi));
}

export async function dekompresi(b64: string): Promise<string> {
  const bytes = stringBase64KeUint8(b64);
  const alur = new DecompressionStream('gzip');
  const penulis = alur.writable.getWriter();
  penulis.write(bytes as BufferSource);
  penulis.close();
  const terdekompresi = await new Response(alur.readable).arrayBuffer();
  return pembacaTeks().decode(new Uint8Array(terdekompresi));
}

export function cekWebCryptoTersedia(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
