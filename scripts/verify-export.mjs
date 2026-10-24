import JSZip from 'jszip';
import fs from 'node:fs';
import { patchTemplate, readCellText, parseSharedStrings, extractCells, getRowXml } from '../src/export/template-patcher.ts';

const buf = fs.readFileSync('D:/APPMI/public/template/Form_Statistik_Umat.xlsx');
const out = await patchTemplate(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  [
    { id: '0001', idKK: 'KK0001', nama: 'Lahang Anyie', jenisKelamin: 'Pria/Laki-laki', tanggalLahir: '27/10/1991', agama: 'Katolik', status: 'Aktif', KUB: 'KUB-A', alamat: '' },
    { id: '0002', idKK: 'KK0001', nama: 'Maria Test', jenisKelamin: 'Wanita/Perempuan', tanggalLahir: '01/01/2000', agama: 'Katolik', status: 'Meninggal', KUB: 'KUB-A', alamat: '' },
  ],
  [{ id: 'KK0001', namaKepalaKeluarga: 'Lahang Anyie', alamat: 'Jl. Test', KUB: 'KUB-A' }],
  { namaLingkungan: 'Lingkungan Test', namaParoki: 'P', tahunStatistik: 2026 });
fs.writeFileSync('D:/APPMI/out-test.xlsx', out);
console.log('bytes: ' + out.length);

const zip = await JSZip.loadAsync(out);
const ss = parseSharedStrings(await zip.file('xl/sharedStrings.xml').async('text'));
const ux = await zip.file('xl/worksheets/sheet4.xml').async('text');
const kx = await zip.file('xl/worksheets/sheet3.xml').async('text');
const rx = await zip.file('xl/worksheets/sheet15.xml').async('text');
for (const r of ['A2','B2','C2','D2','E2','F2','G2','H2','K2','AA1','AA2','AA3','A3','B3']) {
  console.log('UMAT ' + r + ' = ' + readCellText(ux, ss, r));
}
console.log('UMAT F2 formula? ' + (getRowXml(ux, 2).includes('DATEDIF') ? 'YA (dipertahankan)' : 'HILANG!'));
console.log('UMAT F3 formula? ' + ((getRowXml(ux, 3) || '').includes('DATEDIF') || (getRowXml(ux, 3) || '').includes('<f') ? 'YA' : 'tidak'));
for (const r of ['A2','B2','C2','E2','L1','L2','A3','B3']) {
  console.log('KK ' + r + ' = ' + readCellText(kx, ss, r));
}
console.log('KK A2 formula? ' + ((getRowXml(kx, 2) || '').includes('KK') && (getRowXml(kx, 2) || '').includes('<f') ? 'YA (dipertahankan)' : 'CEK'));
console.log('REKAP A5 = ' + readCellText(rx, ss, 'A5'));
console.log('REKAP C5 = ' + readCellText(rx, ss, 'C5'));
console.log('REKAP C5 COUNTIFS-Aktif? ' + (rx.includes('COUNTIFS') && rx.includes('Aktif') ? 'YA' : 'TIDAK'));
console.log('REKAP B5 = ' + readCellText(rx, ss, 'B5'));
console.log('table2: ' + (await zip.file('xl/tables/table2.xml').async('text')).match(/ref="[^"]*"/)[0]);
console.log('table1: ' + (await zip.file('xl/tables/table1.xml').async('text')).match(/ref="[^"]*"/)[0]);
console.log('AA col? ' + (ux.includes('min="27"') ? 'YA' : 'TIDAK'));
console.log('L col? ' + (kx.includes('min="12"') ? 'YA' : 'TIDAK'));
console.log('autofilter UMAT? ' + (ux.match(/<autoFilter[^>]*>/) || ['none'])[0]);
console.log('fullCalc? ' + ((await zip.file('xl/workbook.xml').async('text')).match(/<calcPr[^>]*>/) || ['none'])[0]);
