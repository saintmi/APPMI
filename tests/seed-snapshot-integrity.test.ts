import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('integritas seed snapshot dari Excel', () => {
  const snapshot = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'seed-snapshot.json'), 'utf8'));

  it('memuat KK dan umat', () => {
    expect(Array.isArray(snapshot.kk)).toBe(true);
    expect(snapshot.kk.filter((k: { nomorKK?: string }) => String(k.nomorKK || '').trim()).length).toBeGreaterThan(90);
    expect(Array.isArray(snapshot.umat)).toBe(true);
    expect(snapshot.umat.length).toBeGreaterThan(0);
  });

  it('semua umat merujuk ke KK yang ada', () => {
    const ids = new Set(snapshot.kk.map((k: { id: string }) => k.id));
    for (const u of snapshot.umat) {
      if (u.idKK) expect(ids.has(u.idKK)).toBe(true);
    }
  });

  it('KK hasil scan memiliki nomor dan nama kepala keluarga', () => {
    for (const k of snapshot.kk.filter((x: { nomorKK?: string }) => String(x.nomorKK || '').trim())) {
      expect(String(k.nomorKK || '').trim()).not.toBe('');
      expect(String(k.namaKepalaKeluarga || '').trim()).not.toBe('');
    }
  });
});