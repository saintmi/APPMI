// ============================================================================
// Backtest lokal Fase 7/8 — pipeline impor dengan berkas Excel asli (standalone)
// ============================================================================

import JSZip from 'jszip';
import fs from 'node:fs';
import { deteksiKolomDenganLLM, konversiBarisKeUmat, type DeteksiHasil } from '../src/import/detector.ts';
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
      // Kunci hanya kolom huruf (A, B, C…) sehingga konsisten semua baris
      const kolomHuruf = ref.replace(/\d+$/, '');
      sel[kolomHuruf] = nilai;
    }
    baris.push({ nomor, sel });
  }
  return { nama: namaSheet, baris };
}

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

async function main() {
  console.log('=== BACKTEST IMPOR DENGAN BERKAS EXCEL ASLI ===\n');

  const abOutput = fs.readFileSync(FILE_OUTPUT);
  const sheetsOutput = await parseXlsxManual(abOutput);
  console.log('Sheets output:', sheetsOutput.map(s => s.nama).join(', '), '\n');

  const abMaster = fs.readFileSync(FILE_MASTER);
  const sheetsMaster = await parseXlsxManual(abMaster);
  console.log('Sheets master:', sheetsMaster.map(s => s.nama).join(', '), '\n');

  // DATA UMAT
  const sheetUmat = sheetsOutput.find(s => s.nama === 'DATA UMAT')!;
  const detUmat = await deteksiKolomDenganLLM(sheetUmat, null, SETTINGS);
  console.log('=== DATA UMAT ===');
  console.log('Header baris:', detUmat.barisHeader, '| Data:', detUmat.jumlahData);
  console.log('Peta kolom:', detUmat.pemetaan.map(p => `${p.header}→${p.target}(${p.keyakinan})`).join('; '));
  console.log('Kolom tanpa padanan:', detUmat.kolomTanpaPadanan.join(', ') || '(tidak ada)');

  const barisDataUmat = sheetUmat.baris.slice(detUmat.barisHeader);
  const { umat, peringatan } = konversiBarisKeUmat(barisDataUmat, detUmat.pemetaan, SETTINGS, 1);
  console.log('Umat valid:', umat.length, '| Peringatan:', peringatan.length);
  peringatan.slice(0, 3).forEach(p => console.log('  PERINGATAN:', p));
  console.log('Contoh:', JSON.stringify(umat.slice(0, 2), null, 2));

  // DATA KK
  const sheetKk = sheetsOutput.find(s => s.nama === 'DATA KK')!;
  const detKk = await deteksiKolomDenganLLM(sheetKk, null, SETTINGS);
  console.log('\n=== DATA KK ===');
  console.log('Header baris:', detKk.barisHeader, '| Data:', detKk.jumlahData);
  console.log('Peta kolom:', detKk.pemetaan.map(p => `${p.header}→${p.target}(${p.keyakinan})`).join('; '));

  const barisDataKk = sheetKk.baris.slice(detKk.barisHeader);
  const { umat: umatKk } = konversiBarisKeUmat(barisDataKk, detKk.pemetaan, SETTINGS, 10000);
  console.log('KK valid:', umatKk.length);
  console.log('Contoh:', JSON.stringify(umatKk.slice(0, 2), null, 2));

  // Sheet peristiwa
  const SHEET_PERISTIWA = ['BAPTIS', 'KOMUNI PERTAMA', 'PERKAWINAN GEREJANI', 'PEMBUBARAN', 'PERMINYAKAN SUCI', 'KEMATIAN', 'SEMINARI BIARA', 'DITERIMA MASUK', 'MUTASI'];
  console.log('\n=== SHEET PERISTIWA ===');
  for (const sn of SHEET_PERISTIWA) {
    const sheet = sheetsOutput.find(s => s.nama === sn);
    if (!sheet) { console.log(`${sn}: TIDAK DITEMUKAN`); continue; }
    const det = await deteksiKolomDenganLLM(sheet, null, SETTINGS);
    console.log(`${sn}: header=${det.barisHeader}, data=${det.jumlahData}, kolom=${det.pemetaan.map(p => p.header).join(', ')}`);
  }

  console.log('\n=== BACKTEST SELESAI ===');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
