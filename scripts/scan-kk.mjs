import { createWorker } from 'tesseract.js';
import fs from 'node:fs';
import path from 'node:path';
import { parseKkFields, parseMembers, filenameMatches, norm } from './kk-parser.mjs';

const BASE = 'D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB';
const FOLDERS = [1,2,3,4].map(k => ({ kub: `KUB ${k}`, dir: `${BASE}/BERKAS UMAT KUB ${k}/KK` }));
const snapshot = JSON.parse(fs.readFileSync('D:/APPMI/seed-snapshot.json', 'utf8'));
const appKk = snapshot.kk || [];
const appUmat = snapshot.umat || [];
const appUmatByKk = new Map();
for (const u of appUmat) {
  if (!u.idKK) continue;
  if (!appUmatByKk.has(u.idKK)) appUmatByKk.set(u.idKK, []);
  appUmatByKk.get(u.idKK).push(u);
}
function findAppKk(nama) {
  const n = norm(nama);
  if (!n) return null;
  let r = appKk.find(k => norm(k.namaKepalaKeluarga) === n);
  if (r) return r;
  r = appKk.find(k => { const kn = norm(k.namaKepalaKeluarga); return kn.includes(n) || n.includes(kn); });
  return r || null;
}

const worker = await createWorker('ind');
await worker.setParameters({ tessedit_pageseg_mode: '6' });

const results = [];
let counter = 0;
for (const f of FOLDERS) {
  const files = fs.readdirSync(f.dir).filter(x => /\.(jpe?g|png)$/i.test(x)).sort();
  for (const file of files) {
    counter++;
    const img = f.dir + '/' + file;
    console.log(`[${counter}] ${f.kub} :: ${file}`);
    let text = '', conf = 0;
    try {
      const r = await worker.recognize(img);
      text = r.data.text || '';
      conf = r.data.confidence || 0;
    } catch (e) {
      text = 'ERROR: ' + e.message;
    }
    const fields = parseKkFields(text);
    const members = parseMembers(text);
    const fm = filenameMatches(file, fields.namaKepalaKeluarga);
    const appKkMatch = findAppKk(fields.namaKepalaKeluarga);
    const appMembers = fields.nomorKK ? (appUmatByKk.get(fields.nomorKK) || []) : [];
    // member name match
    const scannedNames = members.map(m => norm(m.nama));
    const appNames = appMembers.map(m => norm(m.nama));
    const matchedMembers = scannedNames.filter(n => appNames.includes(n)).length;
    results.push({
      kub: f.kub,
      file,
      path: img,
      confidence: conf,
      ...fields,
      filenameMatchHead: fm,
      members,
      appMatch: {
        appKkFound: !!appKkMatch,
        appKkName: appKkMatch ? appKkMatch.namaKepalaKeluarga : null,
        appMemberCount: appMembers.length,
        scannedMemberCount: members.length,
        matchedMemberNames: matchedMembers,
      },
      rawText: text,
    });
    // checkpoint
    fs.writeFileSync('D:/APPMI/scripts/scan-progress.json', JSON.stringify(results, null, 2));
  }
}
await worker.terminate();
fs.writeFileSync('D:/APPMI/scripts/scan-results.json', JSON.stringify(results, null, 2));
console.log('DONE', results.length);
