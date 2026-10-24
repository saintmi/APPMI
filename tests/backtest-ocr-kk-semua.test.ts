// ============================================================================
// Backtest — OCR semua berkas scan Kartu Keluarga (KK)
// Menguji apakah semua 113 berkas scan di docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB
// dapat dibaca data intinya (nomor KK, nama kepala keluarga, alamat) melalui tesseract.js.
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ocrKk } from '../src/ocr/ocr-service.ts';

const BASE = 'D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB';
const KUB_FOLDERS = ['BERKAS UMAT KUB 1', 'BERKAS UMAT KUB 2', 'BERKAS UMAT KUB 3', 'BERKAS UMAT KUB 4'];

interface HasilScan {
  kub: string;
  berkas: string;
  path: string;
  sukses: boolean;
  nomorKK?: string;
  namaKepalaKeluarga?: string;
  alamat?: string;
  confidence?: number;
  error?: string;
}

function kumpulkanSemuaBerkas(): HasilScan[] {
  const hasil: HasilScan[] = [];
  for (const kub of KUB_FOLDERS) {
    const folderKK = path.join(BASE, kub, 'KK');
    if (!fs.existsSync(folderKK)) continue;
    for (const berkas of fs.readdirSync(folderKK)) {
      if (!berkas.match(/\.(jpg|jpeg|png|pdf)$/i)) continue;
      hasil.push({
        kub,
        berkas,
        path: path.join(folderKK, berkas),
        sukses: false,
      });
    }
  }
  return hasil;
}

const semuaBerkas = kumpulkanSemuaBerkas();

describe('Backtest OCR — Semua Berkas Scan KK (113 berkas)', () => {
  beforeAll(async () => {
    await ocrKk.init();
  });

  afterAll(async () => {
    await ocrKk.terminate();
  });

  it(`terdapat ${semuaBerkas.length} berkas scan KK di 4 KUB`, () => {
    expect(semuaBerkas.length).toBeGreaterThan(0);
    console.log(`\nTotal berkas scan KK ditemukan: ${semuaBerkas.length}`);
    for (const kub of KUB_FOLDERS) {
      const n = semuaBerkas.filter((b) => b.kub === kub).length;
      console.log(`  ${kub}: ${n} berkas`);
    }
  });

  for (const b of semuaBerkas) {
    it(`[${b.kub}] ${b.berkas}`, async () => {
      try {
        const hasil = await ocrKk.recognize(b.path);
        b.sukses = true;
        b.nomorKK = hasil.nomorKK;
        b.namaKepalaKeluarga = hasil.namaKepalaKeluarga;
        b.alamat = hasil.alamat;
        b.confidence = hasil.confidence;

        console.log(
          `  [OK] ${b.kub} | ${b.berkas} | conf=${(hasil.confidence * 100).toFixed(0)}% | ` +
            `KK=${hasil.nomorKK || '-'} | Nama=${hasil.namaKepalaKeluarga || '-'} | ` +
            `Alamat=${hasil.alamat ? hasil.alamat.slice(0, 40) : '-'}`,
        );

        // Setidaknya salah satu data inti harus terbaca
        expect(
          hasil.nomorKK || hasil.namaKepalaKeluarga || hasil.alamat,
        ).toBeTruthy();
      } catch (err) {
        b.sukses = false;
        b.error = err instanceof Error ? err.message : String(err);
        console.log(`  [FAIL] ${b.kub} | ${b.berkas} | ${b.error}`);
        throw err;
      }
    });
  }

  it('ringkasan: berapa persen berkas berhasil dibaca', () => {
    const total = semuaBerkas.length;
    const sukses = semuaBerkas.filter((b) => b.sukses).length;
    const gagal = total - sukses;

    console.log('\n=== RINGKASAN BACKTEST OCR KK ===');
    console.log(`Total berkas: ${total}`);
    console.log(`Berhasil dibaca: ${sukses}`);
    console.log(`Gagal dibaca: ${gagal}`);
    console.log(`Persentase keberhasilan: ${((sukses / total) * 100).toFixed(1)}%`);

    for (const kub of KUB_FOLDERS) {
      const kubBerkas = semuaBerkas.filter((b) => b.kub === kub);
      const kubSukses = kubBerkas.filter((b) => b.sukses).length;
      console.log(
        `  ${kub}: ${kubSukses}/${kubBerkas.length} (${((kubSukses / kubBerkas.length) * 100).toFixed(1)}%)`,
      );
    }

    if (gagal > 0) {
      console.log('\nBerkas yang gagal:');
      for (const b of semuaBerkas.filter((b) => !b.sukses)) {
        console.log(`  - ${b.kub} | ${b.berkas} | ${b.error}`);
      }
    }

    // Tidak gagalkan tes — ini adalah informasi backtest.
    // Jika ingin mengharuskan 100% sukses, ubah ke: expect(gagal).toBe(0);
    expect(true).toBe(true);
  });
});
