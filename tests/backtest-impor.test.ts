// ============================================================================
// Backtest lokal Fase 7/8 — pipeline impor dengan berkas Excel asli
// Menggunakan JSZip langsung untuk ekstraksi sheet, lalu detektor + konversi
// ============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import JSZip from 'jszip';
import fs from 'node:fs';
import { deteksiKolomDenganLLM, konversiBarisKeUmat, konversiBarisKeKk, type DeteksiHasil } from '../src/import/detector.ts';
import type { Umat } from '../src/engine/types.ts';

const FILE_OUTPUT = 'D:/APPMI/docs/output_statistik_2026_final.xlsx';
const FILE_MASTER = 'D:/APPMI/docs/_Sensus_Umat_Katolik-layout-v3REVISI MASTER.xlsx';

const SETTINGS = {
  namaLingkungan: 'Kasri',
  daftarKUB: ['KUB 1', 'KUB 2', 'KUB 3', 'KUB 4'],
  tanggalAcuan: '31/12/2026',
};

interface SheetBerkas {
  nama: string;
  baris: { nomor: number; sel: Record<string, string | null> }[];
}

let sheetsOutput: SheetBerkas[];
let sheetsMaster: SheetBerkas[];

async function parseXlsxManual(ab: ArrayBuffer): Promise<SheetBerkas[]> {
  const zip = await JSZip.loadAsync(ab);
  const wbXml = await zip.file('xl/workbook.xml')!.async('text');
  const relXml = await zip.file('xl/_rels/workbook.xml.rels')!.async('text');

  const relMap: Record<string, string> = {};
  const relRe = /<Relationship[^>]*\/>/g;
  let m;
  while ((m = relRe.exec(relXml)) !== null) {
    const tag = m[0];
    const idM = tag.match(/\bId="([^"]+)"/);
    const tM = tag.match(/\bTarget="([^"]+)"/);
    if (!idM || !tM) continue;
    let target = tM[1];
    if (target.startsWith('/')) target = target.slice(1);
    if (!target.startsWith('xl/')) target = 'xl/' + target;
    relMap[idM[1]] = target;
  }

  const sheets: SheetBerkas[] = [];
  const shRe = /<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g;
  while ((m = shRe.exec(wbXml)) !== null) {
    const namaSheet = m[1];
    const target = relMap[m[2]] || m[2];
    const sheetXml = await zip.file(target)!.async('text');
    sheets.push(parseSheetXml(sheetXml, namaSheet));
  }
  return sheets;
}

function parseSheetXml(sheetXml: string, namaSheet: string): SheetBerkas {
  const baris: { nomor: number; sel: Record<string, string | null> }[] = [];
  const rowRe = /<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let m;
  while ((m = rowRe.exec(sheetXml)) !== null) {
    const nomor = parseInt(m[1], 10);
    const sel: Record<string, string | null> = {};
    const cellRe = /<c r="([A-Z]+\d+)"[^>]*>([\s\S]*?)<\/c>/g;
    let cm;
    while ((cm = cellRe.exec(m[2])) !== null) {
      const ref = cm[1];
      const isi = cm[2];
      const vRe = /<v>([\s\S]*?)<\/v>/;
      const vm = vRe.exec(isi);
      const tRe = /t="([^"]+)"/;
      const tm = tRe.exec(cm[0]);
      const jenis = tm ? tm[1] : 'n';
      let nilai: string | null = null;
      if (vm) {
        nilai = vm[1];
      } else if (jenis === 'inlineStr') {
        const isRe = /<is><t>([\s\S]*?)<\/t><\/is>/;
        const ism = isRe.exec(isi);
        if (ism) nilai = ism[1];
      }
      // Kunci hanya kolom huruf (A, B, C…) agar konsisten untuk semua baris
      const kolomHuruf = ref.replace(/\d+$/, '');
      sel[kolomHuruf] = nilai;
    }
    baris.push({ nomor, sel });
  }
  return { nama: namaSheet, baris };
}

beforeAll(async () => {
  const abOutput = fs.readFileSync(FILE_OUTPUT);
  sheetsOutput = await parseXlsxManual(abOutput);
  const abMaster = fs.readFileSync(FILE_MASTER);
  sheetsMaster = await parseXlsxManual(abMaster);
});

function hitungUmatValid(det: DeteksiHasil, baris: { nomor: number; sel: Record<string, string | null> }[]): { valid: number; peringatan: string[]; umat: Umat[] } {
  const barisData = baris.slice(det.barisHeader);
  const { umat, peringatan } = konversiBarisKeUmat(barisData, det.pemetaan, SETTINGS, 1);
  return { valid: umat.length, peringatan, umat };
}

describe('Backtest — parse berkas Excel asli (manual JSZip)', () => {
  it('output_statistik_2026_final.xlsx dapat di-parse semua sheet', () => {
    expect(sheetsOutput.length).toBeGreaterThan(0);
    const namaSheet = sheetsOutput.map((s) => s.nama);
    expect(namaSheet).toContain('DATA UMAT');
    expect(namaSheet).toContain('DATA KK');
    console.log('Sheets output:', namaSheet.join(', '));
  });

  it('_Sensus master dapat di-parse', () => {
    expect(sheetsMaster.length).toBeGreaterThan(0);
    console.log('Sheets master:', sheetsMaster.map((s) => s.nama).join(', '));
  });
});

describe('Backtest — deteksi kolom DATA UMAT', () => {
  let detUmat: DeteksiHasil;

  beforeAll(async () => {
    const sheet = sheetsOutput.find((s) => s.nama === 'DATA UMAT')!;
    detUmat = await deteksiKolomDenganLLM(sheet, 'umat', null, SETTINGS);
  });

  it('deteksi header baris ditemukan', () => {
    expect(detUmat.barisHeader).toBeGreaterThan(0);
    console.log('Header baris:', detUmat.barisHeader, '| Data:', detUmat.jumlahData);
  });

  it('kolom utama terdeteksi', () => {
    const target = detUmat.pemetaan.map((p) => p.target);
    expect(target).toContain('nama');
    expect(target).toContain('jenisKelamin');
    expect(target).toContain('tanggalLahir');
    expect(target).toContain('agama');
    expect(target).toContain('status');
    expect(target).toContain('KUB');
    expect(target).toContain('idKK');
    console.log('Peta kolom:', detUmat.pemetaan.map((p) => `${p.header}→${p.target}(${p.keyakinan})`).join('; '));
  });

  it('konversi ke model Umat menghasilkan ≥ 80 data valid', () => {
    const sheet = sheetsOutput.find((s) => s.nama === 'DATA UMAT')!;
    const { valid, peringatan, umat } = hitungUmatValid(detUmat, sheet.baris);
    console.log('Umat valid:', valid, '| Peringatan:', peringatan.length);
    expect(valid).toBeGreaterThanOrEqual(80);
    peringatan.slice(0, 5).forEach((p) => console.log('  PERINGATAN:', p));
    console.log('Contoh umat:', JSON.stringify(umat.slice(0, 2), null, 2));
  });

  it('setiap umat memiliki id dan nama', () => {
    const sheet = sheetsOutput.find((s) => s.nama === 'DATA UMAT')!;
    const barisData = sheet.baris.slice(detUmat.barisHeader);
    const { umat } = konversiBarisKeUmat(barisData, detUmat.pemetaan, SETTINGS, 1);
    for (const u of umat) {
      expect(u.id).toBeTruthy();
      expect(u.nama).toBeTruthy();
    }
  });
});

describe('Backtest — deteksi kolom DATA KK', () => {
  let detKk: DeteksiHasil;

  beforeAll(async () => {
    const sheet = sheetsOutput.find((s) => s.nama === 'DATA KK')!;
    detKk = await deteksiKolomDenganLLM(sheet, 'kk', null, SETTINGS);
  });

  it('kolom KK utama terdeteksi', () => {
    const target = detKk.pemetaan.map((p) => p.target);
    expect(target).toContain('namaKepalaKeluarga');
    expect(target).toContain('idKK');
    expect(target).toContain('alamat');
    console.log('Peta KK:', detKk.pemetaan.map((p) => `${p.header}→${p.target}(${p.keyakinan})`).join('; '));
  });

  it('konversi KK menghasilkan data valid', () => {
    const sheet = sheetsOutput.find((s) => s.nama === 'DATA KK')!;
    const barisData = sheet.baris.slice(detKk.barisHeader);
    const { kk } = konversiBarisKeKk(barisData, detKk.pemetaan, SETTINGS, 10000);
    expect(kk.length).toBeGreaterThan(0);
    console.log('Contoh KK:', JSON.stringify(kk.slice(0, 3), null, 2));
  });
});

describe('Backtest — sheet peristiwa tersedia', () => {
  const SHEET_PERISTIWA = ['BAPTIS', 'KOMUNI PERTAMA', 'PERKAWINAN GEREJANI', 'PEMBUBARAN', 'PERMINYAKAN SUCI', 'KEMATIAN', 'SEMINARI BIARA', 'DITERIMA MASUK', 'MUTASI'];

  for (const sn of SHEET_PERISTIWA) {
    it(`sheet ${sn} dapat di-parse`, async () => {
      const sheet = sheetsOutput.find((s) => s.nama === sn);
      if (!sheet) {
        console.log(`${sn}: TIDAK DITEMUKAN`);
        return;
      }
      const det = await deteksiKolomDenganLLM(sheet, 'peristiwa', null, SETTINGS);
      console.log(`${sn}: header=${det.barisHeader}, data=${det.jumlahData}, kolom=${det.pemetaan.map((p) => p.header).join(', ')}`);
    });
  }
});
