import JSZip from 'jszip';
import fs from 'node:fs';
const z = await JSZip.loadAsync(fs.readFileSync('D:/APPMI/docs/Form Statistik Umat (1).xlsx'));
for (const f of ['xl/worksheets/sheet3.xml', 'xl/worksheets/sheet4.xml']) {
  const x = await z.file(f).async('text');
  console.log('=== ' + f + ' ===');
  const seen = new Map();
  for (const m of x.matchAll(/<f t="shared"([^>]*)\/?>([\s\S]*?)<\/f>|<f (t="shared"[^>]*)\/>/g)) {
    const attrs = m[1] ?? m[3] ?? '';
    const si = (attrs.match(/si="(\d+)"/) || [])[1];
    const ref = (attrs.match(/ref="([^"]+)"/) || [])[1] || '';
    const key = si + '|' + ref;
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  // hitung juga self-closing tanpa body
  for (const m of x.matchAll(/<f t="shared"([^>]*)\/>/g)) {
    const si = (m[1].match(/si="(\d+)"/) || [])[1];
    const key = si + '|(stub)';
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  for (const [k, c] of seen) console.log(' si/ref=' + k + ' count=' + c);
  // definisi berteks (ada isi formula)
  for (const m of x.matchAll(/<c r="([A-Z]+\d+)"[^>]*><f t="shared"([^>]*)>([\s\S]*?)<\/f>/g)) {
    console.log(' DEF ' + m[1] + ' attrs=[' + m[2] + '] formula=' + m[3].slice(0, 120));
  }
}
