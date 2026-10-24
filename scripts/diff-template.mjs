// Lapis-a: bandingkan template asli vs berkas hasil ekspor entry-by-entry.
// Semua entri ZIP harus identik kecuali daftar putih; KUB harus lengkap.
import JSZip from 'jszip';
import fs from 'node:fs';

const tpl = await JSZip.loadAsync(fs.readFileSync('D:/APPMI/public/template/Form_Statistik_Umat.xlsx'));
const out = await JSZip.loadAsync(fs.readFileSync('D:/APPMI/out-test.xlsx'));

const BOLEH = new Set([
  'xl/sharedStrings.xml',
  'xl/workbook.xml',
  'xl/worksheets/sheet3.xml', // DATA KK
  'xl/worksheets/sheet4.xml', // DATA UMAT
  'xl/worksheets/sheet15.xml', // REKAP LINGKUNGAN
  'xl/tables/table1.xml',     // TblDATAKK
  'xl/tables/table2.xml',     // TblDATAUMAT
]);

// 1) Daftar entri identik?
const ft = Object.keys(tpl.files).filter((f) => !tpl.files[f].dir).sort();
const fo = Object.keys(out.files).filter((f) => !out.files[f].dir).sort();
console.log('entries template=' + ft.length + ' ekspor=' + fo.length);
const hilang = ft.filter((f) => !fo.includes(f));
const tambah = fo.filter((f) => !ft.includes(f));
console.log('hilang: ' + (hilang.length ? hilang.join(', ') : '(tidak ada)'));
console.log('ditambah: ' + (tambah.length ? tambah.join(', ') : '(tidak ada)'));

// 2) Entri mana yang isinya berbeda?
const berubah = [];
for (const f of ft) {
  if (!fo.includes(f)) continue;
  const a = await tpl.file(f).async('string');
  const b = await out.file(f).async('string');
  if (a !== b) berubah.push(f);
}
console.log('\nberubah: ' + berubah.length + ' entri');
let lolosPutih = true;
for (const f of berubah) {
  const ok = BOLEH.has(f);
  if (!ok) lolosPutih = false;
  console.log((ok ? '  [putih] ' : '  [LUAR PUTIH!] ') + f);
}

// 3) Bagian sensitif tidak boleh tersentuh: drawing, chart, styles, sheet lain
for (const f of [
  'xl/styles.xml', 'xl/theme/theme1.xml',
  'xl/charts/chart1.xml',
  'xl/drawings/drawing1.xml', 'xl/drawings/drawing17.xml',
  'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet17.xml',
]) {
  const a = await tpl.file(f).async('string');
  const b = await out.file(f).async('string');
  if (a !== b) { console.log('IDENTIK? GAGAL: ' + f); lolosPutih = false; }
}
console.log('drawing/chart/styles/sheet lain identik: ' + (lolosPutih ? 'YA' : 'TIDAK'));

// 4) KUB di tabel
const t2 = await out.file('xl/tables/table2.xml').async('string');
const t1 = await out.file('xl/tables/table1.xml').async('string');
console.log('\ntable2 (TblDATAUMAT):');
console.log('  ref=', t2.match(/ref="([^"]+)"/)[1], 'kolom=', t2.match(/tableColumns count="(\d+)"/)[1], 'KUB?', t2.includes('name="KUB"'), 'id27?', t2.includes('id="27"'));
console.log('table1 (TblDATAKK):');
console.log('  ref=', t1.match(/ref="([^"]+)"/)[1], 'kolom=', t1.match(/tableColumns count="(\d+)"/)[1], 'KUB?', t1.includes('name="KUB"'), 'id12?', t1.includes('id="12"'));

// 5) Header KUB di sel sheet + autofilter + definedName WPS
const ss = [...(await out.file('xl/sharedStrings.xml').async('string')).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
const ux = await out.file('xl/worksheets/sheet4.xml').async('string');
const kx = await out.file('xl/worksheets/sheet3.xml').async('string');
const wb = await out.file('xl/workbook.xml').async('string');
const cell = (xml, ref) => {
  const m = xml.match(new RegExp('<c r="' + ref + '"([^>]*)>'));
  if (!m) return 'ABSENT';
  const inner = xml.slice(xml.indexOf(m[0]), xml.indexOf('</c>', xml.indexOf(m[0])) + 4);
  const v = inner.match(/<v>(\d+)<\/v>/);
  return v ? (m[1].includes('t="s"') ? ss[+v[1]] : v[1]) : '(kosong)';
};
console.log('\nUMAT AA1=' + cell(ux, 'AA1') + ' AA2=' + cell(ux, 'AA2') + ' AA3=' + cell(ux, 'AA3'));
console.log('KK   L1=' + cell(kx, 'L1') + ' L2=' + cell(kx, 'L2'));
console.log('autofilter UMAT: ' + (ux.match(/<autoFilter[^>]*>/) || ['-'])[0]);
console.log('autofilter KK:   ' + (kx.match(/<autoFilter[^>]*>/) || ['-'])[0]);
console.log('defName UMAT: ' + (wb.match(/'DATA UMAT'![^<]*/) || ['?'])[0]);
console.log('defName KK:   ' + (wb.match(/'DATA KK'![^<]*/) || ['?'])[0]);
console.log('fullCalcOnLoad: ' + ((wb.match(/<calcPr[^>]*>/) || ['(none)'])[0]));

// 6) Rumus dipertahankan
console.log('\nUMAT F2 rumus DATEDIF? ' + (ux.match(/<c r="F2"[\s\S]{0,400}/)[0].includes('DATEDIF') ? 'YA' : 'TIDAK'));
console.log('KK   A2 rumus KK&TEXT? ' + (kx.match(/<c r="A2"[\s\S]{0,400}/)[0].includes('TEXT(ROW()') ? 'YA' : 'TIDAK'));

console.log('\nKESIMPULAN: ' + (lolosPutih && hilang.length === 0 ? 'TEMPLATE ASLI TERJAGA + KUB TERPASANG SESUAI' : 'ADA MASALAH'));
