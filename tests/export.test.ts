import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import fs from 'node:fs';
import { computeRekap } from '../src/engine/rekap.ts';
import { terapkanStatus } from '../src/engine/status.ts';
import { patchTemplate, parseSharedStrings, readCellText, getRowXml } from '../src/export/template-patcher.ts';
import type { Settings, Umat, Kk, Peristiwa } from '../src/engine/types.ts';

const TPL = 'D:/APPMI/public/template/Form_Statistik_Umat.xlsx';
function tplBuffer(): ArrayBuffer {
  const b = fs.readFileSync(TPL);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}
const SET: Settings = { namaLingkungan: 'Lingkungan Test', daftarKUB: ['KUB-A'], tahunStatistik: 2026, tanggalAcuan: '31/12/2026' };
const UMAT: Umat[] = [
  { id: 'UM00001', idKK: 'KK0001', nama: 'Lahang Anyie', jenisKelamin: 'Laki-laki', tanggalLahir: '27/10/1991', agama: 'Katolik', status: 'Aktif', KUB: 'KUB-A', alamat: '' },
  { id: 'UM00002', idKK: 'KK0001', nama: 'Maria Test', jenisKelamin: 'Perempuan', tanggalLahir: '01/01/2000', agama: 'Katolik', status: 'Meninggal', KUB: 'KUB-A', alamat: '' },
];
const PERISTIWA: Peristiwa[] = [
  { id: 'e1', jenis: 'DITERIMA MASUK', idUmat: 'UM00001', nama: 'Lahang Anyie', lingkungan: 'Lingkungan Test', jenisKelamin: 'Laki-laki', tanggalLahir: '27/10/1991', tanggal: '01/01/2026', keterangan: '' },
  { id: 'e2', jenis: 'KEMATIAN', idUmat: 'UM00002', nama: 'Maria Test', lingkungan: 'Lingkungan Test', jenisKelamin: 'Perempuan', tanggalLahir: '01/01/2000', tanggal: '05/05/2026', keterangan: '' },
];
const KK: Kk[] = [{ id: 'KK0001', nomorKK: '1', namaKepalaKeluarga: 'Lahang Anyie', alamat: 'Jl. Test', KUB: 'KUB-A' }];
const BOLEH: Set<string> = new Set(['xl/sharedStrings.xml', 'xl/workbook.xml', 'xl/worksheets/sheet4.xml', 'xl/worksheets/sheet3.xml', 'xl/worksheets/sheet15.xml', 'xl/tables/table1.xml', 'xl/tables/table2.xml']);

describe('Fase2 ekspor template', () => {
  it('lapis-a: ekspor kosong hanya ubah daftar putih', async () => {
    const out = await patchTemplate(tplBuffer(), [], [], SET);
    const zt = await JSZip.loadAsync(fs.readFileSync(TPL));
    const zo = await JSZip.loadAsync(out);
    for (const name of Object.keys(zt.files)) {
      if (zt.files[name].dir) continue;
      const a = await zt.file(name)!.async('string');
      const f = zo.file(name);
      expect(f, 'hilang: ' + name).not.toBeNull();
      if ((await f!.async('string')) !== a) expect(BOLEH.has(name), 'berubah di luar putih: ' + name).toBe(true);
    }
  }, 180_000);
  it('sel input tertulis, rumus dipertahankan', async () => {
    const out = await patchTemplate(tplBuffer(), UMAT, KK, SET);
    const zo = await JSZip.loadAsync(out);
    const ss = parseSharedStrings(await zo.file('xl/sharedStrings.xml')!.async('text'));
    const ux = await zo.file('xl/worksheets/sheet4.xml')!.async('text');
    const kx = await zo.file('xl/worksheets/sheet3.xml')!.async('text');
    const rx = await zo.file('xl/worksheets/sheet15.xml')!.async('text');
    expect(readCellText(ux, ss, 'A2')).toBe('UM00001');
    expect(readCellText(ux, ss, 'C2')).toBe('Lahang Anyie');
    expect(readCellText(ux, ss, 'K2')).toBe('Aktif');
    expect(readCellText(ux, ss, 'K3')).toBe('Meninggal');
    expect(readCellText(ux, ss, 'AA1')).toBe('KUB');
    expect(readCellText(ux, ss, 'AA2')).toBe('KUB-A');
    expect(getRowXml(ux, 2)!.includes('DATEDIF')).toBe(true);
    expect(readCellText(kx, ss, 'B2')).toBe('Lahang Anyie');
    expect((getRowXml(kx, 2) || '').includes('<f')).toBe(true);
    expect(readCellText(rx, ss, 'A5')).toBe('Lingkungan Test');
    expect(rx.includes('COUNTIFS') && rx.includes('Aktif')).toBe(true);
    expect(readCellText(rx, ss, 'C5')).toBe('1');
    expect(readCellText(rx, ss, 'B5')).toBe('1');
  }, 180_000);
  it('lapis-b: struktur KUB lengkap', async () => {
    const out = await patchTemplate(tplBuffer(), UMAT, KK, SET);
    const zo = await JSZip.loadAsync(out);
    const ux = await zo.file('xl/worksheets/sheet4.xml')!.async('text');
    const kx = await zo.file('xl/worksheets/sheet3.xml')!.async('text');
    const t2 = await zo.file('xl/tables/table2.xml')!.async('text');
    const t1 = await zo.file('xl/tables/table1.xml')!.async('text');
    const wb = await zo.file('xl/workbook.xml')!.async('text');
    expect(ux.includes('min="27"')).toBe(true);
    expect(kx.includes('min="12"')).toBe(true);
    expect(t2.includes('ref="A1:AA2001"') && t2.includes('name="KUB"')).toBe(true);
    expect(t1.includes('ref="A1:L501"') && t1.includes('name="KUB"')).toBe(true);
    expect(ux.includes('$A$1:$AA$2001')).toBe(true);
    expect(wb.includes("'DATA UMAT'!$A$1:$AA$2001")).toBe(true);
    expect(wb.includes("'DATA KK'!$A$1:$L$501")).toBe(true);
    expect(wb.includes('fullCalcOnLoad="1"')).toBe(true);
  }, 180_000);
  it('cache REKAP sama dengan computeRekap', async () => {
    const rekap = computeRekap(UMAT, PERISTIWA, SET);
    expect(rekap.find((r) => r.label === 'Total Jiwa Aktif')?.nilai).toBe(1);
    const out = await patchTemplate(tplBuffer(), UMAT, KK, SET);
    const zo = await JSZip.loadAsync(out);
    const ss = parseSharedStrings(await zo.file('xl/sharedStrings.xml')!.async('text'));
    const rx = await zo.file('xl/worksheets/sheet15.xml')!.async('text');
    expect(readCellText(rx, ss, 'C5')).toBe('1');
  }, 180_000);

  it('kolom Status ditulis dari status turunan peristiwa', async () => {
    const resolved = terapkanStatus(UMAT, PERISTIWA, SET.tanggalAcuan);
    const out = await patchTemplate(tplBuffer(), resolved, KK, SET);
    const zo = await JSZip.loadAsync(out);
    const ss = parseSharedStrings(await zo.file('xl/sharedStrings.xml')!.async('text'));
    const ux = await zo.file('xl/worksheets/sheet4.xml')!.async('text');
    expect(readCellText(ux, ss, 'K2')).toBe('Aktif');
    expect(readCellText(ux, ss, 'K3')).toBe('Meninggal');
  }, 180_000);

  it('lapis-c: ID tetap — rekaman yang dihapus di tengah tidak menggeser ID lain', async () => {
    // UM00002 dihapus; UM00003 tetap di baris 4 (baris 3 dikosongkan).
    const umat = [UMAT[0], { ...UMAT[1], id: 'UM00003' }];
    const out = await patchTemplate(tplBuffer(), umat, KK, SET);
    const zo = await JSZip.loadAsync(out);
    const ss = parseSharedStrings(await zo.file('xl/sharedStrings.xml')!.async('text'));
    const ux = await zo.file('xl/worksheets/sheet4.xml')!.async('text');
    expect(readCellText(ux, ss, 'A2')).toBe('UM00001');
    expect(readCellText(ux, ss, 'C2')).toBe('Lahang Anyie');
    expect(readCellText(ux, ss, 'A4')).toBe('UM00003');
    expect(readCellText(ux, ss, 'C4')).toBe('Maria Test');
    const kosong = readCellText(ux, ss, 'C3');
    expect(kosong === null || kosong === '').toBe(true);
  }, 180_000);

  it('lapis-c: ID KK pada DATA UMAT sama dengan ID Excel pada DATA KK', async () => {
    const kk = [{ ...KK[0] }, { id: 'KK0003', nomorKK: '3', namaKepalaKeluarga: 'Keluarga Kedua', alamat: 'Jl. Kedua', KUB: 'KUB-A' }];
    const umat = [UMAT[0], { ...UMAT[1], id: 'UM00003', idKK: 'KK0003' }];
    const out = await patchTemplate(tplBuffer(), umat, kk, SET);
    const zo = await JSZip.loadAsync(out);
    const ss = parseSharedStrings(await zo.file('xl/sharedStrings.xml')!.async('text'));
    const ux = await zo.file('xl/worksheets/sheet4.xml')!.async('text');
    const kx = await zo.file('xl/worksheets/sheet3.xml')!.async('text');
    // DATA UMAT B4 menunjuk ID KK yang tertulis di DATA KK
    expect(readCellText(ux, ss, 'B4')).toBe('KK0003');
    expect(readCellText(kx, ss, 'A4')).toBe('KK0003');
  }, 180_000);
});
