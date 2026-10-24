import JSZip from 'jszip';
import fs from 'node:fs';

const zip = await JSZip.loadAsync(fs.readFileSync('D:/APPMI/docs/Form Statistik Umat (1).xlsx'));
const ss = [...(await zip.file('xl/sharedStrings.xml').async('text')).matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(m => m[1]);

// ID formulas full text
for (const [n, f] of [['DATA KK','xl/worksheets/sheet3.xml'],['BAPTIS','xl/worksheets/sheet5.xml'],['KEMATIAN','xl/worksheets/sheet13.xml'],['DATA KK A10','xl/worksheets/sheet3.xml']]) {
  const xml = await zip.file(f).async('text');
  const ref = n.includes('A10') ? 'A10' : 'A2';
  const m = xml.match(new RegExp('<c r="' + ref + '"[^>]*>([\\s\\S]*?)<\\/c>'));
  console.log(n + ' ' + ref + ': ' + (m ? m[1].slice(0, 600) : '(empty/absent)'));
}
// DATA UMAT row2 full inners
const ux = await zip.file('xl/worksheets/sheet4.xml').async('text');
console.log('\nDATA UMAT row2 full:');
const r2 = ux.match(/<row[^>]*r="2"[^>]*>([\s\S]*?)<\/row>/);
for (const c of [...r2[1].matchAll(/<c r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g)]) {
  let inner = c[3].slice(0, 300);
  const vM = c[3].match(/<v>([\s\S]*?)<\/v>/);
  if (c[2].includes('t="s"') && vM) inner = 'SHARED[' + vM[1] + ']=' + (ss[parseInt(vM[1])] || '').slice(0,40) + ' | raw:' + c[3].slice(0,120);
  console.log(' ' + c[1] + ' attrs=[' + c[2] + '] ' + inner);
}
// Z1 K1 styles + row1 Z/K inner
for (const ref of ['Z1', 'K1', 'A1', 'B1']) {
  const m = ux.match(new RegExp('<c r="' + ref + '"([^>]*)>([\\s\\S]*?)<\\/c>'));
  console.log('UMAT ' + ref + ': ' + (m ? m[1] + ' inner=' + m[2].slice(0,120) : 'absent'));
}
const kx = await zip.file('xl/worksheets/sheet3.xml').async('text');
for (const ref of ['K1', 'A1', 'B1']) {
  const m = kx.match(new RegExp('<c r="' + ref + '"([^>]*)>([\\s\\S]*?)<\\/c>'));
  console.log('KK ' + ref + ': ' + (m ? m[1] + ' inner=' + m[2].slice(0,120) : 'absent'));
}
// LIST B11:B27 (lingkungan values)
const lx = await zip.file('xl/worksheets/sheet2.xml').async('text');
console.log('\nLIST col B rows 1-30:');
for (let r = 1; r <= 30; r++) {
  const m = lx.match(new RegExp('<c r="B' + r + '"([^>]*)>([\\s\\S]*?)<\\/c>'));
  if (!m) { console.log(' B' + r + ': absent'); continue; }
  const vM = m[2].match(/<v>([\s\S]*?)<\/v>/);
  let v = vM ? vM[1] : '';
  if (m[1].includes('t="s"')) v = ss[parseInt(v)];
  console.log(' B' + r + ': ' + (v || '').slice(0, 50));
}
// dimension + cols raw
console.log('\nUMAT ' + (ux.match(/<dimension[^>]*>/) || ['none'])[0]);
console.log('UMAT cols: ' + (ux.match(/<cols>[\s\S]*?<\/cols>/) || ['none'])[0].slice(0,1500));
console.log('KK ' + (kx.match(/<dimension[^>]*>/) || ['none'])[0]);
console.log('KK cols: ' + (kx.match(/<cols>[\s\S]*?<\/cols>/) || ['none'])[0].slice(0,1500));
// styles 8-20
const stx = await zip.file('xl/styles.xml').async('text');
const xfs = [...stx.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/)[1].matchAll(/<xf[^>]*>/g)];
xfs.forEach((x, i) => { if (i >= 7 && i <= 20) console.log('xf' + i + ': ' + x[0]); });
console.log('numFmts: ' + (stx.match(/<numFmts[^>]*>[\s\S]*?<\/numFmts>/) || ['none'])[0].slice(0,600));
// REKAP C5 exact + A5 exact
const rx = await zip.file('xl/worksheets/sheet15.xml').async('text');
console.log('\nREKAP A5: ' + (rx.match(/<c r="A5"[^>]*>([\s\S]*?)<\/c>/) || ['absent'])[0].slice(0,300));
console.log('REKAP B5: ' + (rx.match(/<c r="B5"[^>]*>([\s\S]*?)<\/c>/) || ['absent'])[0].slice(0,400));
console.log('REKAP C5: ' + (rx.match(/<c r="C5"[^>]*>([\s\S]*?)<\/c>/) || ['absent'])[0].slice(0,600));
// table XMLs
for (const t of ['xl/tables/table1.xml', 'xl/tables/table2.xml', 'xl/tables/table13.xml']) {
  console.log('\n' + t + ': ' + (await zip.file(t).async('text')).slice(0, 1200));
}
