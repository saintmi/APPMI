// Backtest out-test.xlsx: simulasikan rumus terhadap data tertulis.
import JSZip from 'jszip';
import fs from 'node:fs';

const out = await JSZip.loadAsync(fs.readFileSync('D:/APPMI/out-test.xlsx'));
const ss = [...(await out.file('xl/sharedStrings.xml').async('string')).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'));

function cells(xml) {
  const map = new Map();
  const re = /<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const inner = m[3] ?? '';
    const v = inner.match(/<v>([\s\S]*?)<\/v>/);
    map.set(m[1], {
      t: (m[2].match(/t="([^"]+)"/) || [])[1],
      f: (inner.match(/<f[^>]*>([\s\S]*?)<\/f>/) || [])[1],
      v: v ? v[1] : undefined,
      fSelf: /<f[^>]*\/>/.test(inner),
    });
  }
  return map;
}
const val = (c) => {
  if (!c || c.v === undefined || c.v === '') return '';
  return c.t === 's' ? ss[+c.v] : c.v;
};

const ux = await out.file('xl/worksheets/sheet4.xml').async('string');
const kx = await out.file('xl/worksheets/sheet3.xml').async('string');
const rx = await out.file('xl/worksheets/sheet15.xml').async('string');
const uc = cells(ux), kc = cells(kx), rc = cells(rx);

// ---- 1. Rumus master shared tidak rusak ----
console.log('=== 1. MASTER RUMUS SHARED ===');
const master = (xml, ref) => {
  const c = cells(xml).get(ref);
  return c ? (c.f !== undefined ? 'utuh: ' + c.f.slice(0, 60) : (c.fSelf ? 'stub-ok' : 'KOSONG')) : 'ABSENT';
};
console.log('UMAT F2 :', master(ux, 'F2'));
console.log('UMAT A3 :', master(ux, 'A3'));
console.log('KK   A2 :', master(kx, 'A2'));
for (const [nm, xml] of [['UMAT', ux], ['KK', kx]]) {
  const stubs = [...xml.matchAll(/<f t="shared" si="(\d+)"\/>/g)].map((m) => m[1]);
  const defs = [...xml.matchAll(/<f t="shared"[^>]*ref="[^"]+"[^>]*si="(\d+)"/g)].map((m) => m[1]);
  const yatim = [...new Set(stubs)].filter((si) => !defs.includes(si));
  console.log(nm + ' stub si=[' + [...new Set(stubs)].join(',') + '] def si=[' + defs.join(',') + '] yatim=[' + yatim.join(',') + ']');
}

// ---- 2. Simulasi REKAP dari data tertulis ----
console.log('\n=== 2. SIMULASI RUMUS REKAP vs CACHE ===');
const lingkungan = val(rc.get('A5'));
console.log('A5 nama lingkungan =', JSON.stringify(lingkungan));
const umatRows = [];
for (let r = 2; r <= 2001; r++) {
  if (val(uc.get('C' + r)) === '' && val(uc.get('B' + r)) === '') continue;
  umatRows.push({ row: r, nama: val(uc.get('C' + r)), H: val(uc.get('H' + r)), K: val(uc.get('K' + r)), E: uc.get('E' + r)?.v, F: uc.get('F' + r) });
}
const kkRows = [];
for (let r = 2; r <= 501; r++) {
  if (val(kc.get('B' + r)) === '') continue;
  kkRows.push({ row: r, E: val(kc.get('E' + r)) });
}
console.log('baris DATA UMAT tertulis =', umatRows.length, '| DATA KK =', kkRows.length);
const b5 = kkRows.filter((k) => k.E === lingkungan).length;
console.log('B5 COUNTIF(KK E=A5): hitung=' + b5 + ' cache=' + JSON.stringify(val(rc.get('B5'))) + (b5 === +val(rc.get('B5')) ? ' OK' : ' BEDA!'));
const c5 = umatRows.filter((u) => u.H === lingkungan && u.K === 'Aktif').length;
console.log('C5 COUNTIFS(H=A5,K=Aktif): hitung=' + c5 + ' cache=' + JSON.stringify(val(rc.get('C5'))) + (c5 === +val(rc.get('C5')) ? ' OK' : ' BEDA!'));

// ---- 3. Umur DATEDIF sim vs cache ----
console.log('\n=== 3. UMUR (DATEDIF) SIMULASI vs CACHE ===');
for (const u of umatRows) {
  if (!u.E) continue;
  const lahir = new Date(Date.UTC(1899, 11, 30) + (+u.E) * 86400000);
  const acuan = new Date(Date.UTC(2026, 11, 31));
  let umur = acuan.getUTCFullYear() - lahir.getUTCFullYear();
  if (acuan.getUTCMonth() < lahir.getUTCMonth() || (acuan.getUTCMonth() === lahir.getUTCMonth() && acuan.getUTCDate() < lahir.getUTCDate())) umur--;
  console.log('  F' + u.row + ' cache=' + JSON.stringify(u.F && u.F.v) + ' simulasi=' + umur + (String(umur) === (u.F && u.F.v) ? ' OK' : ' BEDA!'));
}

// ---- 4. Rumus DETAIL/DASHBOARD utuh ----
console.log('\n=== 4. RUMUS DETAIL/DASHBOARD ===');
const dx = await out.file('xl/worksheets/sheet16.xml').async('string');
const dash = await out.file('xl/worksheets/sheet17.xml').async('string');
const totalF = (x) => (x.match(/<f/g) || []).length;
console.log('REKAP DETAIL <f> =', totalF(dx), '| DASHBOARD <f> =', totalF(dash));
console.log('DETAIL COUNTIFS utuh?', dx.includes('COUNTIFS') ? 'YA' : 'TIDAK');
console.log('DASHBOARD rujuk REKAP?', dash.includes("REKAP LINGKUNGAN'!") ? 'YA' : 'TIDAK');

// ---- 5. Validasi dropdown utuh ----
console.log('\n=== 5. VALIDASI DROPDOWN DATA UMAT ===');
for (const m of ux.matchAll(/<dataValidation [^>]*sqref="([^"]+)"[^>]*>\s*<formula1>([^<]+)<\/formula1>/g)) {
  console.log('  ' + m[1] + ' <- ' + m[2]);
}

// ---- 6. XML C5 baru valid ----
console.log('\n=== 6. XML RUMUS C5 BARU ===');
const c5raw = rx.match(/<c r="C5"[\s\S]{0,600}?(<\/c>)/);
console.log((c5raw ? c5raw[0] : 'ABSENT').slice(0, 480));
console.log('entitas tak ter-escape?', /&(?!amp;|lt;|gt;|quot;|apos;|#)/.test(c5raw ? c5raw[0] : '') ? 'YA (RUSAK!)' : 'tidak');
console.log('\nSELESAI — periksa baris "BEDA!" bila ada.');

