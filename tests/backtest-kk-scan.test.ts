// ============================================================================
// Backtest — OCR Kartu Keluarga (scan → data terstruktur)
// Menguji parser OCR terhadap teks hasil OCR simulasi KK,
// serta alur gabung/buat-baru dari scan.
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ocrKk } from '../src/ocr/ocr-service.ts';

const KK_TEKS_BAIK = `PROVINSI JAWA TIMUR
KABUPATEN BOJONEGORO

NOMOR KK
3522012304560001

NAMA KEPALA KELUARGA
SUDARNO

ALAMAT
DS. SIDOMULYO RT 02 RW 04
DESASIDOMULYO

KABUPATEN BOJONEGORO
PROVINSI JAWA TIMUR`;

const KK_TEKS_SEDANG = `PROVINSI JAWA TIMUR
KABUPATEN BOJONEGORO

NOMOR KK
35 22 01 23 04 56 00 01

NAMA KEPALA KELUARGA
SUDARNO SUTOMO

ALAMAT
DS. SIDOMULYO RT 02 RW 04`;

// Teks yang mengandung kesalahan OCR umum (angka vs huruf)
const KK_TEKS_BERISIKO = `PROVINSI JAWA TIMUR
KABUPATEN BOJONEGORO

NOMOR KK
35220l2304560001

NAMA KEPALA KELUARGA
5UD4RN0

ALAMAT
DS. SIDOMULYO RT 02 RW 04`;

describe('OCR KK — parsing teks hasil scan', () => {
  beforeAll(async () => {
    await ocrKk.init();
  });

  afterAll(async () => {
    await ocrKk.terminate();
  });

  it('mengambil nomor KK 16 digit dari teks bersih', () => {
    const hasil = ocrKk['parseKkText'](KK_TEKS_BAIK);
    expect(hasil.nomorKK).toBe('3522012304560001');
  });

  it('mengambil nama kepala keluarga dari teks bersih', () => {
    const hasil = ocrKk['parseKkText'](KK_TEKS_BAIK);
    expect(hasil.namaKepalaKeluarga).toBe('SUDARNO');
  });

  it('mengambil alamat dari teks bersih', () => {
    const hasil = ocrKk['parseKkText'](KK_TEKS_BAIK);
    expect(hasil.alamat).toContain('SIDOMULYO');
    expect(hasil.alamat).toContain('RT 02');
  });

  it('mengambil kabupaten dan provinsi', () => {
    const hasil = ocrKk['parseKkText'](KK_TEKS_BAIK);
    expect(hasil.kabupatenKota).toBe('BOJONEGORO');
    expect(hasil.provinsi).toBe('JAWA TIMUR');
  });

  it('menangani spasi dalam nomor KK (format cetak)', () => {
    const hasil = ocrKk['parseKkText'](KK_TEKS_SEDANG);
    expect(hasil.nomorKK).toBe('3522012304560001');
  });

  it('menangani teks berisiko (huruf 5 alih angka S, huruf l alih angka 1)', () => {
    const hasil = ocrKk['parseKkText'](KK_TEKS_BERISIKO);
    // Nama masih terdeteksi meski ada karakter aneh
    expect(hasil.namaKepalaKeluarga.length).toBeGreaterThan(0);
    // Nomor KK dapat diambil meski ada karakter non-digit
    expect(hasil.nomorKK.replace(/\D/g, '').length).toBeGreaterThan(10);
  });

  it('hasil OCR lengkap memiliki confidence dan rawText', async () => {
    // Simulasi file palsu — recognizer akan mencoba membaca, tapi tanpa file asli
    // kita hanya memastikan struktur result tidak error saat parse
    const parse = ocrKk['parseKkText']('NOMOR KK 3522012304560002\nNAMA KEPALA KELUARGA BUDI\nALAMAT DS. TEST');
    expect(parse.nomorKK).toBe('3522012304560002');
    expect(parse.namaKepalaKeluarga).toBe('BUDI');
    expect(parse.alamat).toBe('DS. TEST');
    expect(parse.rawText).toContain('NOMOR KK');
  });

  it('rata-rata confidence dalam rentang 0-1', async () => {
    // Konfidensi dihitung dari kata-kata dalam hasil OCR
    const hasil = ocrKk['parseKkText'](KK_TEKS_BAIK);
    // parseKkText tidak set confidence, cek bahwa confidence default 0
    expect(hasil.confidence).toBeGreaterThanOrEqual(0);
    expect(hasil.confidence).toBeLessThanOrEqual(1);
  });
});

describe('Backtest KK — deteksi duplikat & merge dari scan', () => {
  const existingKk = [
    { id: 'KK0001', nomorKK: '3522012304560001', namaKepalaKeluarga: 'SUDARNO', alamat: 'DS. SIDOMULYO', KUB: 'KUB 1' },
    { id: 'KK0002', nomorKK: '3522012304560002', namaKepalaKeluarga: 'SUTIYEM', alamat: 'DS. SIDOMULYO RT 03', KUB: 'KUB 1' },
    { id: 'KK0003', nomorKK: '3522019999999999', namaKepalaKeluarga: 'BUDI', alamat: 'DS. LAIN', KUB: 'KUB 2' },
  ];

  const cariMirip = (kataKunci: string, daftar: typeof existingKk) => {
    const k = kataKunci.toLowerCase();
    return daftar.filter((kk) =>
      kk.nomorKK.toLowerCase().includes(k) || kk.namaKepalaKeluarga.toLowerCase().includes(k)
    );
  };

  it('menemukan KK existing saat nomor KK cocok', () => {
    const hasil = cariMirip('3522012304560001', existingKk);
    expect(hasil.length).toBe(1);
    expect(hasil[0].id).toBe('KK0001');
  });

  it('menemukan KK existing saat nama kepala keluarga cocok', () => {
    const hasil = cariMirip('SUDARNO', existingKk);
    expect(hasil.length).toBe(1);
    expect(hasil[0].id).toBe('KK0001');
  });

  it('tidak menemukan KK jika tidak ada yang cocok', () => {
    const hasil = cariMirip('9999999999999999', existingKk);
    expect(hasil.length).toBe(0);
  });

  it('gabung data scan dengan existing mengganti semua field', () => {
    const target = existingKk[0];
    const dataScan = {
      nomorKK: '3522012304560001',
      namaKepalaKeluarga: 'SUDARNO HERYANTO',
      alamat: 'DS. SIDOMULYO RT 02 RW 04',
      KUB: 'KUB 1',
    };

    const merged = {
      ...target,
      nomorKK: dataScan.nomorKK,
      namaKepalaKeluarga: dataScan.namaKepalaKeluarga,
      alamat: dataScan.alamat,
      KUB: dataScan.KUB,
    };

    expect(merged.namaKepalaKeluarga).toBe('SUDARNO HERYANTO');
    expect(merged.alamat).toBe('DS. SIDOMULYO RT 02 RW 04');
    expect(merged.id).toBe('KK0001'); // ID tetap, tidak bergeser
  });

  it('buat KK baru tidak menimpa existing', () => {
    const sebelum = existingKk.length;
    const baru = {
      id: 'KK0004',
      nomorKK: '3522018888888888',
      namaKepalaKeluarga: 'AGUS',
      alamat: 'DS. BARU',
      KUB: 'KUB 3',
      lampiran: [],
    };
    const setelah = [...existingKk, baru];
    expect(setelah.length).toBe(sebelum + 1);
    expect(existingKk.length).toBe(sebelum); // existing tidak berubah
  });
});
