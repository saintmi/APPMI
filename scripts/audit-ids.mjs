import JSZip from 'jszip';
import fs from 'node:fs';

const z = await JSZip.loadAsync(fs.readFileSync('D:/APPMI/public/template/Form_Statistik_Umat.xlsx'));
const ss = [...(await z.file('xl/sharedStrings.xml').async('text')).matchAll(/<si>([\s\S]*?)<\/si>/g)]
  .map(m => m[1].replace(/<[^>]+>/g, ''));
const val = (inner, attrs) => {
  const vm = inner.match(/<v>([\s\S]*?)<\/v>/);
  if (!vm) return '(no v)';
  return attrs.includes('t="s"') ? ss[parseInt(vm[1])] : vm[1];
};
async function dumpColA(file, rows) {
  const xml = await z.file(file).async('text');
  console.log('=== ' + file + ' col A ===');
  for (const r of rows) {
    const m = xml.match(new RegExp('<c r="A' + r + '"([^>]*)>([\\s\\S]*?)<\\/c>'));
    if (!m) { console.log(' A' + r + ': ABSENT'); continue; }
    const hasF = m[2].includes('<f');
    const fm = m[2].match(/<f[^>]*>([\s\S]*?)<\/f>/);
    console.log(' A' + r + ' attrs=[' + m[1] + '] formula=' + (hasF ? (fm ? fm[1].slice(0,120) : 'self-closing/shared-ref') : 'NO') + ' value=' + val(m[2], m[1]).slice(0,40));
  }
}
await dumpColA('xl/worksheets/sheet4.xml', [1,2,3,4,5]);
await dumpColA('xl/worksheets/sheet3.xml', [1,2,3,4]);
await dumpColA('xl/worksheets/sheet5.xml', [1,2,3]);
await dumpColA('xl/worksheets/sheet13.xml', [1,2,3]);
await dumpColA('xl/worksheets/sheet7.xml', [1,2,3]);
// header row event sheets: which col is ID?
for (const [nm, f] of [['BAPTIS','xl/worksheets/sheet5.xml'],['MUTASI','xl/worksheets/sheet7.xml'],['KEMATIAN','xl/worksheets/sheet13.xml']]) {
  const xml = await z.file(f).async('text');
  const r1 = xml.match(/<row [^>]*r="1"[^>]*>([\s\S]*?)<\/row>/);
  const cells = [...r1[1].matchAll(/<c r="([A-Z]+)1"([^>]*)>([\s\S]*?)<\/c>/g)].map(c => c[1] + '=' + val(c[3], c[2]).slice(0,25));
  console.log(nm + ' headers: ' + cells.join(' | '));
}
// REKAP B5/C5 exact
const rx = await z.file('xl/worksheets/sheet15.xml').async('text');
for (const ref of ['B5','C5']) {
  const m = rx.match(new RegExp('<c r="' + ref + '"[^>]*>([\\s\\S]*?)<\\/c>'));
  console.log(ref + ': ' + (m ? m[1].slice(0, 400) : 'ABSENT'));
}
